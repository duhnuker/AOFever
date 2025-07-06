import { Box, Container, Flex, Heading, Text, Button, Badge, Strong } from '@radix-ui/themes';
import { useState } from 'react';
import axios from 'axios';
import PlayerAutocomplete from '../../components/PlayerAutocomplete';
import FilterDropdown from '../../components/FilterDropdown';
import { useAtpPlayerData } from '../../hooks/useAtpPlayerData';
import { useAtpData } from '../../hooks/useAtpData';
import BettingOdds from '../../components/BettingOdds';
import Header from '../../components/Header';
import ScrollVelocity from '../../components/ScrollVelocity';
import DotGrid from '../../components/DotGrid';

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
    const [winner, setWinner] = useState('');
    const [confidencePercentage, setConfidencePercentage] = useState('');

    const { players, loading: playersLoading, error: playersError, getPlayerStats } = useAtpPlayerData();
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

            setWinner(response.data.prediction.winner);
            setConfidencePercentage(response.data.prediction.confidencePercentage);
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
            <Box className='bg-gradient-to-t from-zinc-900 to-zinc-700 min-h-screen'>
                <Header />
                <Container size="4" className='px-2 sm:px-4 md:px-6'>
                    <Box className='text-center mt-20'>
                        <Text className='text-white'>Loading data...</Text>
                    </Box>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className='bg-gradient-to-t from-zinc-900 to-zinc-700 min-h-screen'>
                <Header />
                <Container size="4" className='px-2 sm:px-4 md:px-6'>
                    <Flex justify="center" className='my-8 sm:my-14'>
                        <Heading
                            as='h1'
                            size={{ initial: '6', sm: '7', md: '8', lg: '9' }}
                            className='text-center text-white !font-serif px-2 sm:px-4'
                        >
                            Men's Head to Head
                        </Heading>
                    </Flex>
                    <Box className='text-center'>
                        <Text color="red" className='text-red-500'>Error loading data: {error}</Text>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box className='bg-gradient-to-t from-zinc-900 to-zinc-700 min-h-screen'>
            <Header />
            <Container size="4" className='px-2 sm:px-4 md:px-6'>
                {/* Main content wrapper with vertical centering */}
                <Flex direction="column" justify="center" align="center" className='min-h-[calc(100vh-80px)]'>
                    <Flex justify="center" className='mb-6'>
                        <Heading
                            as='h1'
                            size={{ initial: '6', sm: '7', md: '8', lg: '9' }}
                            className='text-center text-white motion-preset-oscillate motion-duration-2500 !font-serif px-2 sm:px-4'
                        >
                            Men's Head to Head Predictor
                        </Heading>
                    </Flex>

                    <Box style={{ width: '100%', height: '150px', position: 'relative', maxWidth: '800px' }}>
                        <DotGrid
                            dotSize={10}
                            gap={15}
                            baseColor="#black"
                            activeColor="#BBF451"
                            proximity={120}
                            shockRadius={250}
                            shockStrength={5}
                            resistance={750}
                            returnDuration={1.5}
                        />
                    </Box>

                    <Flex direction="column" align="center" gap="4" className='w-full max-w-4xl'>
                        {/* Player Selection */}
                        <Flex justify="center" gap="4" className='w-full max-w-2xl'>
                            <Flex direction="column" align="center">
                                <Text className='text-white font-medium pb-4 motion-preset-oscillate motion-duration-2500 '>Enter Player 1:</Text>
                                <PlayerAutocomplete
                                    onPlayerSelect={setPlayer1}
                                    players={players}
                                />
                            </Flex>
                            <Flex direction="column" align="center">
                                <Text className='text-white font-medium pb-4 motion-preset-oscillate motion-duration-2500 '>Enter Player 2:</Text>
                                <PlayerAutocomplete
                                    onPlayerSelect={setPlayer2}
                                    players={players}
                                />
                            </Flex>
                        </Flex>

                        {/* Filter Dropdowns */}
                        <Flex justify="center" className='mt-4'>
                            <Text size="3" weight="bold" className='text-white mb-2 block'>
                                Filters (Optional)
                            </Text>
                        </Flex>
                        <Flex justify="center" gap="3" wrap="wrap" className='w-full max-w-2xl motion-preset-fade motion-duration-2000'>
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

                        {/* Player Stats Display */}
                        {(player1 || player2) && (
                            <Flex gap="4" className='w-full max-w-4xl mt-4'>
                                {/* Player 1 Stats */}
                                <Box style={{ flex: 1 }}>
                                    {player1 && (
                                        <Box className='bg-zinc-800 border border-zinc-700 rounded-lg p-4'>
                                            <Heading size="3" className='text-green-500 mb-2 text-center font-semibold'>
                                                {player1}
                                            </Heading>
                                            {player1Stats ? (
                                                <Flex direction="column" gap="2">
                                                    <Text size="2" className='text-white'>
                                                        <Strong>Rank:</Strong> {player1Stats.rank}
                                                    </Text>
                                                    <Text size="2" className='text-white'>
                                                        <Strong>Points:</Strong> {player1Stats.points}
                                                    </Text>
                                                    <Text size="2" className='text-gray-400'>
                                                        <Strong>As of:</Strong> {player1Stats.date}
                                                    </Text>
                                                    <Button onClick={() => setPlayer1('')}>Remove player</Button>
                                                </Flex>
                                            ) : (
                                                <Text size="2" className='text-gray-400'>
                                                    No stats available
                                                </Text>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                {/* VS Divider */}
                                {player1 && player2 && (
                                    <Flex align="center" justify="center" style={{ minWidth: '40px' }}>
                                        <Text size="4" weight="bold" className='text-lime-300'>
                                            VS
                                        </Text>
                                    </Flex>
                                )}

                                {/* Player 2 Stats */}
                                <Box style={{ flex: 1 }}>
                                    {player2 && (
                                        <Box className='bg-zinc-800 border border-zinc-700 rounded-lg p-4'>
                                            <Heading size="3" className='text-red-500 mb-2 text-center font-semibold'>
                                                {player2}
                                            </Heading>
                                            {player2Stats ? (
                                                <Flex direction="column" gap="2">
                                                    <Text size="2" className='text-white'>
                                                        <Strong>Rank:</Strong> {player2Stats.rank}
                                                    </Text>
                                                    <Text size="2" className='text-white'>
                                                        <Strong>Points:</Strong> {player2Stats.points}
                                                    </Text>
                                                    <Text size="2" className='text-gray-400'>
                                                        <Strong>As of:</Strong> {player2Stats.date}
                                                    </Text>
                                                    <Button onClick={() => setPlayer2('')}>Remove player</Button>
                                                </Flex>
                                            ) : (
                                                <Text size="2" className='text-gray-400'>
                                                    No stats available
                                                </Text>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Flex>
                        )}

                        {/* Selected Filters Display */}
                        {(selectedSurface || selectedRound || selectedBestOf) && (
                            <Box className='bg-zinc-800 border border-zinc-700 rounded-lg p-3 w-full max-w-4xl mt-4'>
                                <Flex justify="center">
                                    <Text size="2" weight="bold" className='text-white mb-2 block'>
                                        Active Filters:
                                    </Text>
                                </Flex>
                                <Flex gap="2" wrap="wrap" justify="center">
                                    {selectedSurface && (
                                        <Badge size="2" className='!bg-lime-300 !text-black'>
                                            Surface: {selectedSurface}
                                        </Badge>
                                    )}
                                    {selectedRound && (
                                        <Badge size="2" className='!bg-lime-300 !text-black'>
                                            Round: {selectedRound}
                                        </Badge>
                                    )}
                                    {selectedBestOf && (
                                        <Badge size="2" className='!bg-lime-300 !text-black'>
                                            Best of: {selectedBestOf}
                                        </Badge>
                                    )}
                                </Flex>
                            </Box>
                        )}

                        <Box className='mt-4'>
                            <BettingOdds onOddsChange={handleOddsChange} />
                        </Box>

                        {winner && confidencePercentage && (
                            <Box className='bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-4xl mt-4'>
                                <Flex justify="center" align="center" gap="4" className='text-center'>
                                    <Text className='text-lime-200 font-bold text-lg'>
                                        Winner: <span className='text-green-500'>{winner}</span>
                                    </Text>
                                    <Text className='text-lime-200 font-bold text-lg'>
                                        Confidence: <span className='text-lime-300'>{confidencePercentage}%</span>
                                    </Text>
                                </Flex>
                                <Flex className='mt-4' justify="center">
                                    <Button className='!bg-red-600 hover:!bg-red-700' onClick={() => {
                                        setPlayer1(''),
                                            setPlayer2(''),
                                            setSelectedSurface(''),
                                            setSelectedRound(''),
                                            setSelectedBestOf(''),
                                            setIsSubmitting(false),
                                            setSubmitMessage(''),
                                            setBettingOdds({
                                                player1Odds: '1.50',
                                                player2Odds: '1.50',
                                                enabled: false
                                            }),
                                            setWinner(''),
                                            setConfidencePercentage('')
                                    }}
                                    >Reset</Button>
                                </Flex>
                            </Box>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={!player1 || !player2 || isSubmitting}
                            size="3"
                            className='!bg-lime-300 !text-black hover:!bg-lime-400 disabled:!bg-gray-600 disabled:!text-gray-400 mt-4 !motion-preset-fade !motion-duration-2000'
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Players'}
                        </Button>

                        {submitMessage && (
                            <Text
                                className={submitMessage.includes('Error') || submitMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}
                                size="2"
                            >
                                {submitMessage}
                            </Text>
                        )}
                    </Flex>
                    <ScrollVelocity
                        texts={["AOFever"]}
                        velocity={50}
                        className="!mb-5 md:!mb-12 !mt-16 !text-white"
                    />
                </Flex>


            </Container>
        </Box>

    );
};

export default MensHeadToHead;
