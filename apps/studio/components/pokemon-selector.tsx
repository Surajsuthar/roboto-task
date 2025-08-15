"use client";

import { WarningOutlineIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useEffect, useState, useMemo } from "react";
import { set, unset } from "sanity";
import { useClient } from "sanity";
import { useDebounce } from "../utils/debounce";
import { PokemonApiType } from "../utils/types";
import { fetchPokemon } from "../utils/helper";


export function PokemonSelector({ value, onChange, readOnly }: any) {
  const client = useClient();

  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PokemonApiType | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedTerm = useDebounce(term, 300);

  const handleSelect = useCallback(
    async (pokemon: PokemonApiType) => {
      setIsCreating(true);
      setError(null);
      try {
        const existingPokemon = await client.fetch(
          `*[_type == "pokemon" && id == $id][0]`,
          { id: pokemon.id }
        );

        let pokemonDoc = existingPokemon;

        if (!existingPokemon) {
          const docId = `pokemon-${pokemon.id}`;
          pokemonDoc = await client.createOrReplace({
            _id: docId,
            _type: "pokemon",
            id: pokemon.id,
            name: pokemon.name,
            sprite: pokemon.sprites?.front_default || null,
          });
        }

        setSelectedPokemon(pokemonDoc);
        onChange(set({ _type: "reference", _ref: pokemonDoc._id }));

        setResult(null);
        setTerm("");
      } catch (err: any) {
        console.error("Error creating/selecting Pokemon:", err);
        setError(`Error selecting Pokémon: ${err.message || "Unknown error"}`);
      } finally {
        setIsCreating(false);
      }
    },
    [client, onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedPokemon(null);
    setResult(null);
    setTerm("");
    setError(null);
    onChange(unset());
  }, [onChange]);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    })();
  }, [debouncedTerm]);

  useEffect(() => {
    if (value?._ref && !selectedPokemon) {
      client
        .fetch(`*[_id == $id][0]`, { id: value._ref })
        .then((pokemon) => {
          if (pokemon) setSelectedPokemon(pokemon);
          else onChange(unset());
        })
        .catch(() => onChange(unset()));
    }
  }, [value?._ref, selectedPokemon, client, onChange]);

  const resultCard = useMemo(
    () =>
      result && !selectedPokemon ? (
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
                overflow: "hidden",
              }}
            >
              {result.sprites?.front_default ? (
                <img
                  src={result.sprites.front_default}
                  alt={result.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Text>🔮</Text>
              )}
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
              disabled={readOnly || isLoading || isCreating}
            />
          </Flex>
        </Card>
      ) : null,
    [result, selectedPokemon, handleSelect, readOnly, isLoading, isCreating]
  );

  const selectedCard = useMemo(
    () =>
      selectedPokemon ? (
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
                overflow: "hidden",
              }}
            >
              {selectedPokemon.sprite ? (
                <img
                  src={selectedPokemon.sprite}
                  alt={selectedPokemon.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Text>✅</Text>
              )}
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
      ) : null,
    [selectedPokemon]
  );

  return (
    <Stack space={3}>
      <Text size={1} weight="medium">
        Search Pokémon
      </Text>

      <Flex gap={2} align="center">
        <Box flex={1}>
          <TextInput
            value={term}
            onChange={(e) => setTerm(e.currentTarget.value)}
            placeholder="e.g. pikachu, bulbasaur, charizard"
            disabled={readOnly || isLoading}
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

      {(isLoading || isCreating) && (
        <Text size={1} muted>
          {isCreating ? "Creating Pokémon document..." : "Loading..."}
        </Text>
      )}

      {error && (
        <Flex gap={2} align="center">
          <WarningOutlineIcon />
          <Text size={1}>{error}</Text>
        </Flex>
      )}

      {resultCard}
      {selectedCard}
    </Stack>
  );
}

export default PokemonSelector;
