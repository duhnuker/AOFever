import { Box, Container, Flex, Heading, Text, Button, Card } from '@radix-ui/themes';
import { useState } from 'react';
import axios from 'axios';
import PlayerAutocomplete from '../../components/PlayerAutocomplete';
import FilterDropdown from '../../components/FilterDropdown';
import { usePlayerData } from '../../hooks/usePlayerData';
import { useAtpData } from '../../hooks/useAtpData';
import BettingOdds from '../../components/BettingOdds';

const MensHeadToHead = () => {
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [selectedSurface, setSelectedSurface] = useState('');
    const [selectedRound, setSelectedRound] = useState('');
    const [selectedBestOf, setSelectedBestOf] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [bettingOdds, setBettingOdds] = useState({
        player1Odds: '1.50',
        player2Odds: '1.50',
        enabled: false
    });
    
    const { players, loading: playersLoading, error: playersError, getPlayerStats } = usePlayerData();
    const { filters, loading: filtersLoading, error: filtersError } = useAtpData();

    // Get player stats
    const player1Stats = player1 ? getPlayerStats(player1) : null;
    const player2Stats = player2 ? getPlayerStats(player2) : null;

    const handleOddsChange = (odds: { player1Odds: string; player2Odds: string; enabled: boolean }) => {
        setBettingOdds(odds);
    };

    const handleSubmit = async () => {
        if (!player1 || !player2) {
            setSubmitMessage('Please select both players');
            return;
        }

        if (player1 === player2) {
            setSubmitMessage('Please select different players');
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const player1OddsValue = bettingOdds.player1Odds || '1.50';
            const player2OddsValue = bettingOdds.player2Odds || '1.50';

            // Prepare the request payload with player stats
            const requestPayload = {
                player1,
                player2,
                surface: selectedSurface,
                round: selectedRound,
                bestOf: selectedBestOf,
                player1Odds: player1OddsValue,
                player2Odds: player2OddsValue,
                ...(player1Stats && { player1Stats }),
                ...(player2Stats && { player2Stats })
            };

            console.log('Sending request with player stats:', requestPayload);

            const response = await axios.post('http://localhost:5000/api/predict/predictmenswinner', requestPayload);

            setSubmitMessage('Players submitted successfully!');
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error submitting players:', error);

            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error || error.message;
                setSubmitMessage(`Error: ${errorMessage}`);
            } else {
                setSubmitMessage('Failed to submit players. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const loading = playersLoading || filtersLoading;
    const error = playersError || filtersError;

    if (loading) {
        return (
            <Box>
                <Container>
                    <Box className='text-center'>
                        <Heading>MensHeadToHead</Heading>
                        <Text>Loading data...</Text>
                    </Box>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Container>
                    <Box className='text-center'>
                        <Heading>MensHeadToHead</Heading>
                        <Text color="red">Error loading data: {error}</Text>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <Container>
                <Box className='text-center'>
                    <Heading>MensHeadToHead</Heading>
                </Box>
                <Flex direction="column" align="center" gap="4" style={{ marginTop: '20px' }}>
                    {/* Player Selection */}
                    <Flex justify="center" gap="4" style={{ width: '100%', maxWidth: '800px' }}>
                        <PlayerAutocomplete
                            placeholder="Search player 1:"
                            onPlayerSelect={setPlayer1}
                            players={players}
                        />
                        <PlayerAutocomplete
                            placeholder="Search player 2:"
                            onPlayerSelect={setPlayer2}
                            players={players}
                        />
                    </Flex>

                    {/* Filter Dropdowns */}
                    <Box style={{ width: '100%', maxWidth: '800px' }}>
                        <Text size="3" weight="bold" style={{ marginBottom: '8px', display: 'block' }}>
                            Filters (Optional)
                        </Text>
                        <Flex justify="center" gap="3" wrap="wrap">
                            <FilterDropdown
                                placeholder="Select Surface"
                                options={filters.surfaces}
                                value={selectedSurface}
                                onValueChange={setSelectedSurface}
                            />
                            <FilterDropdown
                                placeholder="Select Round"
                                options={filters.rounds}
                                value={selectedRound}
                                onValueChange={setSelectedRound}
                            />
                            <FilterDropdown
                                placeholder="Select Best Of"
                                options={filters.bestOfs}
                                value={selectedBestOf}
                                onValueChange={setSelectedBestOf}
                            />
                        </Flex>
                    </Box>

                    {/* Player Stats Display */}
                    {(player1 || player2) && (
                        <Flex gap="4" style={{ width: '100%', maxWidth: '800px' }}>
                            {/* Player 1 Stats */}
                            <Box style={{ flex: 1 }}>
                                {player1 && (
                                    <Card style={{ padding: '16px', textAlign: 'center' }}>
                                        <Heading size="3" style={{ marginBottom: '8px' }}>
                                            {player1}
                                        </Heading>
                                        {player1Stats ? (
                                            <Flex direction="column" gap="2">
                                                <Text size="2">
                                                    <strong>Rank:</strong> {player1Stats.rank}
                                                </Text>
                                                <Text size="2">
                                                    <strong>Points:</strong> {player1Stats.points}
                                                </Text>
                                                <Text size="2" color="gray">
                                                    <strong>As of:</strong> {player1Stats.date}
                                                </Text>
                                            </Flex>
                                        ) : (
                                            <Text size="2" color="gray">
                                                No stats available
                                            </Text>
                                        )}
                                    </Card>
                                )}
                            </Box>

                            {/* VS Divider */}
                            {player1 && player2 && (
                                <Flex align="center" justify="center" style={{ minWidth: '40px' }}>
                                    <Text size="4" weight="bold" color="gray">
                                        VS
                                    </Text>
                                </Flex>
                            )}

                            {/* Player 2 Stats */}
                            <Box style={{ flex: 1 }}>
                                {player2 && (
                                    <Card style={{ padding: '16px', textAlign: 'center' }}>
                                        <Heading size="3" style={{ marginBottom: '8px' }}>
                                            {player2}
                                        </Heading>
                                        {player2Stats ? (
                                            <Flex direction="column" gap="2">
                                                <Text size="2">
                                                    <strong>Rank:</strong> {player2Stats.rank}
                                                </Text>
                                                <Text size="2">
                                                    <strong>Points:</strong> {player2Stats.points}
                                                </Text>
                                                <Text size="2" color="gray">
                                                    <strong>As of:</strong> {player2Stats.date}
                                                </Text>
                                            </Flex>
                                        ) : (
                                            <Text size="2" color="gray">
                                                No stats available
                                            </Text>
                                        )}
                                    </Card>
                                )}
                            </Box>
                        </Flex>
                    )}

                    {/* Selected Filters Display */}
                    {(selectedSurface || selectedRound || selectedBestOf) && (
                        <Card style={{ padding: '12px', width: '100%', maxWidth: '800px' }}>
                            <Text size="2" weight="bold" style={{ marginBottom: '4px' }}>
                                Active Filters:
                            </Text>
                            <Flex gap="2" wrap="wrap">
                                {selectedSurface && (
                                    <Text size="1" style={{ 
                                        backgroundColor: 'var(--accent-3)', 
                                        padding: '2px 6px', 
                                        borderRadius: '4px' 
                                    }}>
                                        Surface: {selectedSurface}
                                    </Text>
                                )}
                                {selectedRound && (
                                    <Text size="1" style={{ 
                                        backgroundColor: 'var(--accent-3)', 
                                        padding: '2px 6px', 
                                        borderRadius: '4px' 
                                    }}>
                                        Round: {selectedRound}
                                    </Text>
                                )}
                                {selectedBestOf && (
                                    <Text size="1" style={{ 
                                        backgroundColor: 'var(--accent-3)', 
                                        padding: '2px 6px', 
                                        borderRadius: '4px' 
                                    }}>
                                        Best of: {selectedBestOf}
                                    </Text>
                                )}
                            </Flex>
                        </Card>
                    )}

                    <BettingOdds onOddsChange={handleOddsChange} />

                    <Button
                        onClick={handleSubmit}
                        disabled={!player1 || !player2 || isSubmitting}
                        size="3"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Players'}
                    </Button>

                    {submitMessage && (
                        <Text
                            color={submitMessage.includes('Error') || submitMessage.includes('Failed') ? 'red' : 'green'}
                            size="2"
                        >
                            {submitMessage}
                        </Text>
                    )}
                </Flex>
            </Container>
        </Box>
    );
};

export default MensHeadToHead;
