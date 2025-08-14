import { useClient } from "sanity";
import { WarningOutlineIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useEffect, useState } from "react";
import { set, unset, type ReferenceInputProps } from "sanity";
import { useDebounce } from "../utils/debounce";

type PokemonApiType = {
  id: number;
  name: string;
  sprites?: { front_default?: string | null };
  types?: Array<{ slot: number; type: { name: string } }>;
};

export type PokemonValue = { _ref: string; _type: "reference" };

// Fetch Pokémon from public API
async function fetchPokemon(term: string): Promise<PokemonApiType | null> {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return null;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`);
    if (!res.ok) return null;
    return (await res.json()) as PokemonApiType;
  } catch {
    return null;
  }
}

export function PokemonSelector(props: ReferenceInputProps) {
  const { value, onChange, readOnly, path } = props;
  const client = useClient();

  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PokemonApiType | null>(null);

  const hasSelection = Boolean(value?._ref);
  const debouncedTerm = useDebounce(term, 300);

  const handleApply = useCallback(
    async (api: PokemonApiType | null) => {
      try {
        if (api) {
          // Create the Pokemon document first
          const pokemonDoc = await client.createIfNotExists({
            _id: `pokemon-${api.id}`,
            _type: "pokemon",
            id: api.id,
            name: api.name,
            types: api.types?.map(t => t.type.name) ?? [],
            sprite: api.sprites?.front_default ?? "",
          });
          
          // Set the reference
          onChange(set({ _ref: pokemonDoc._id, _type: "reference" }));
        } else {
          // Clear the reference
          onChange(unset());
        }
      } catch (err) {
        console.error("Error handling Pokemon selection:", err);
        setError("Failed to save Pokemon selection");
      }
    },
    [client, onChange]
  );

  const handleClear = useCallback(() => {
    handleApply(null);
    setResult(null);
    setTerm("");
    setError(null);
  }, [handleApply]);

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
            onChange={(e) => setTerm(e.currentTarget.value)}
            placeholder="e.g. pikachu, bulbasaur, charizard"
            disabled={readOnly}
          />
        </Box>
        {hasSelection && (
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

      {isLoading && <Text size={1} muted>Loading...</Text>}

      {error && (
        <Flex gap={2} align="center">
          <WarningOutlineIcon />
          <Text size={1} >{error}</Text>
        </Flex>
      )}

      {result && !hasSelection && (
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
                fontSize: "24px"
              }}
            >
              🔮
            </Box>
            <Box flex={1}>
              <Text size={2} weight="semibold">
                {result.name}
              </Text>
              <Text size={1} muted>
                {(result.types ?? []).map(t => t.type.name).join(", ")}
              </Text>
            </Box>
            <Button
              text="Select"
              tone="primary"
              onClick={() => handleApply(result)}
              disabled={readOnly}
            />
          </Flex>
        </Card>
      )}

      {hasSelection && (
        <Card padding={3} radius={2} shadow={1} tone="positive">
          <Flex align="center" gap={3}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}
            >
              ✅
            </Box>
            <Box flex={1}>
              <Text size={2} weight="semibold">Pokémon Selected</Text>
              <Text size={1} muted>ID: {value?._ref}</Text>
            </Box>
          </Flex>
        </Card>
      )}
    </Stack>
  );
}

export default PokemonSelector;