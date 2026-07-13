'use strict';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

function normalizeForPokeApi(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[.'’:]/g, '')
    .replace(/\s+/g, '-');
}

function cleanFlavorText(text) {
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' });
    return;
  }

  const { image } = req.body || {};
  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    res.status(400).json({ error: 'No image provided.' });
    return;
  }

  const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'Invalid image data.' });
    return;
  }
  const [, mediaType, base64Data] = match;

  let pokemonName;
  try {
    const visionResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 30,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
              {
                type: 'text',
                text:
                  'Look at this image. It may be a photo of a Pokémon plushie, toy, drawing, or something ' +
                  'that merely resembles a Pokémon. Identify the single Pokémon it most resembles. Respond ' +
                  'with ONLY the official English species name (e.g. "Pikachu"), nothing else. If nothing in ' +
                  'the image resembles any Pokémon at all, respond with exactly UNKNOWN.',
              },
            ],
          },
        ],
      }),
    });

    if (!visionResponse.ok) {
      const errBody = await visionResponse.text();
      console.error('Anthropic API error:', visionResponse.status, errBody);
      res.status(502).json({ error: 'Image recognition service failed.' });
      return;
    }

    const visionData = await visionResponse.json();
    pokemonName = ((visionData.content && visionData.content[0] && visionData.content[0].text) || '').trim();
  } catch (err) {
    console.error('Vision request failed:', err);
    res.status(502).json({ error: 'Image recognition service failed.' });
    return;
  }

  if (!pokemonName || pokemonName.toUpperCase() === 'UNKNOWN') {
    res.status(404).json({ error: "Couldn't spot a Pokémon in that photo. Try a clearer shot!" });
    return;
  }

  const slug = normalizeForPokeApi(pokemonName);

  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${slug}`),
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) {
      res.status(404).json({
        error: `Identified "${pokemonName}" but couldn't find its Pokédex entry.`,
        guess: pokemonName,
      });
      return;
    }

    const pokemon = await pokemonRes.json();
    const species = await speciesRes.json();

    const flavorEntry = species.flavor_text_entries.find((e) => e.language.name === 'en') || null;
    const genusEntry = species.genera.find((g) => g.language.name === 'en') || null;

    res.status(200).json({
      guess: pokemonName,
      id: pokemon.id,
      name: pokemon.name,
      sprite:
        (pokemon.sprites &&
          pokemon.sprites.other &&
          pokemon.sprites.other['official-artwork'] &&
          pokemon.sprites.other['official-artwork'].front_default) ||
        (pokemon.sprites && pokemon.sprites.front_default) ||
        null,
      types: pokemon.types.map((t) => t.type.name),
      abilities: pokemon.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
      height: pokemon.height,
      weight: pokemon.weight,
      stats: pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
      genus: genusEntry ? genusEntry.genus : null,
      flavorText: flavorEntry ? cleanFlavorText(flavorEntry.flavor_text) : null,
      color: species.color ? species.color.name : null,
      habitat: species.habitat ? species.habitat.name : null,
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      eggGroups: species.egg_groups.map((g) => g.name),
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    });
  } catch (err) {
    console.error('PokeAPI request failed:', err);
    res.status(502).json({ error: 'Pokédex service failed.', guess: pokemonName });
  }
};
