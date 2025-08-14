"use client";

import { WarningOutlineIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useEffect, useState } from "react";
import { set, unset } from "sanity";
import { useDebounce } from "../utils/debounce";

type PokemonApiType = {
  id: number;
  name: string;
  sprites?: { front_default?: string | null };
};

async function fetchPokemon(term: string): Promise<PokemonApiType | null> {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return null;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`);
    if (!res.ok) return null;
    const data = (await res.json()) as PokemonApiType;

    // Log the exact data we're getting
    console.log("Pokemon data:", JSON.stringify(data, null, 2));
    console.log("Sprite URL:", data.sprites?.front_default);
    console.log("Sprite URL type:", typeof data.sprites?.front_default);

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export function PokemonSelector(props: any) {
  const { value, onChange, readOnly } = props;

  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PokemonApiType | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonApiType | null>(
    null,
  );

  const debouncedTerm = useDebounce(term, 300);

  const handleSelect = useCallback(
    (pokemon: PokemonApiType) => {
      console.log("Selecting pokemon:", pokemon);

      // Clean up the pokemon data to match schema expectations
      const cleanPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites?.front_default || null, // Also set the simple sprite field
      };

      setSelectedPokemon(pokemon);
      onChange(set(cleanPokemon));
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setSelectedPokemon(null);
    setResult(null);
    setTerm("");
    setError(null);
    onChange(unset());
  }, [onChange]);

  useEffect(() => {
    console.log("Effect running with debouncedTerm:", debouncedTerm);

    if (!debouncedTerm) {
      setResult(null);
      setError(null);
      return;
    }

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = await fetchPokemon(debouncedTerm);
        console.log("Fetch result:", api);
        if (!api) {
          setResult(null);
          setError("No Pokémon found");
        } else {
          setResult(api);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResult(null);
        setError("Error searching for Pokémon");
      }
      setIsLoading(false);
    })();
  }, [debouncedTerm]);

  return (
    <Stack space={3}>
      <Text size={1} weight="medium">
        Search Pokémon
      </Text>

      <Flex gap={2} align="center">
        <Box flex={1}>
          <TextInput
            value={term}
            onChange={(e) => {
              console.log("Input changing to:", e.currentTarget.value);
              setTerm(e.currentTarget.value);
            }}
            placeholder="e.g. pikachu, bulbasaur, charizard"
            disabled={readOnly}
          />
        </Box>
        {selectedPokemon && (
          <Button
            mode="ghost"
            padding={3}
            tone="caution"
            disabled={readOnly}
            onClick={handleClear}
            text="Clear"
          />
        )}
      </Flex>

      {isLoading && (
        <Text size={1} muted>
          Loading...
        </Text>
      )}

      {error && (
        <Flex gap={2} align="center">
          <WarningOutlineIcon />
          <Text size={1}>{error}</Text>
        </Flex>
      )}

      {result && !selectedPokemon && (
        <Card padding={3} radius={2} shadow={1} tone="primary">
          <Flex align="center" gap={3}>
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                backgroundColor: "#f6f6f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* COMPLETELY REMOVED IMAGE - JUST SHOW EMOJI */}
              <Text>🔮</Text>
            </Box>
            <Box flex={1}>
              <Text size={2} weight="semibold">
                {result.name}
              </Text>
              <Text size={1} muted>
                ID: {result.id}
              </Text>
            </Box>
            <Button
              text="Select"
              tone="primary"
              onClick={() => handleSelect(result)}
              disabled={readOnly}
            />
          </Flex>
        </Card>
      )}

      {selectedPokemon && (
        <Card padding={3} radius={2} shadow={1} tone="positive">
          <Flex align="center" gap={3}>
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* ALSO NO IMAGE HERE */}
              <Text>✅</Text>
            </Box>
            <Box flex={1}>
              <Text size={2} weight="semibold">
                Selected: {selectedPokemon.name}
              </Text>
              <Text size={1} muted>
                ID: {selectedPokemon.id}
              </Text>
            </Box>
          </Flex>
        </Card>
      )}
    </Stack>
  );
}

export default PokemonSelector;
