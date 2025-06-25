import { Heading, Table, Box, Flex, Container, Text, Card, Badge } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import ScrollVelocity from '../../components/ScrollVelocity';

interface AOMensFinalsData {
  id: number;
  year: number;
  champion_country: string;
  champion_name: string;
  runner_up_country: string;
  runner_up: string;
  score: string;
}

const AOMensSingles = () => {
  const [finalsData, setFinalsData] = useState<AOMensFinalsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinalsData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ausopenfinals/aomenssinglesfinals');

        if (Array.isArray(response.data)) {
          setFinalsData(response.data);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFinalsData();
  }, []);

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;

  return (
    <Box className='bg-gradient-to-t from-zinc-900 to-zinc-700 min-h-screen'>

      <Header />

      <Container size="4" className='px-2 sm:px-4 md:px-6'>
        <Flex justify="center" className='my-8 sm:my-14'>
          <Heading
            as='h1'
            size={{ initial: '6', sm: '7', md: '8', lg: '9' }}
            className='text-center text-white motion-preset-oscillate motion-duration-2500 !font-serif px-2 sm:px-4'
          >
            Australian Open Men's Singles Finals
          </Heading>
        </Flex>

        {/* Desktop Table */}
        <Box className='!hidden md:!block mb-8'>
          <Table.Root className='table-bordered rounded-3xl overflow-hidden'>
            <Table.Header className='bg-lime-300 text-lg text-center'>
              <Table.Row>
                <Table.ColumnHeaderCell>Year</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Champion Country</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Champion</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Runner-Up Country</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Runner-Up</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Score
                  <Text size="1" className='block text-xs'>
                    () = Points in Tie-Breaker
                  </Text>
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body className='text-center'>
              {finalsData.map((final) => (
                <Table.Row className='border-1' key={final.id}>
                  <Table.Cell className='text-white !bg-zinc-800 font-bold'>{final.year}</Table.Cell>
                  <Table.Cell className='text-white !bg-zinc-900 font-medium'>{final.champion_country}</Table.Cell>
                  <Table.Cell className='text-green-500 !bg-zinc-800 font-semibold'>{final.champion_name}</Table.Cell>
                  <Table.Cell className='text-white !bg-zinc-900 font-medium'>{final.runner_up_country}</Table.Cell>
                  <Table.Cell className='text-red-500 !bg-zinc-800 font-semibold'>{final.runner_up}</Table.Cell>
                  <Table.Cell className='text-lime-200 !bg-zinc-900 font-medium'>{final.score}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* Mobile Cards */}
        <Box className='md:!hidden !block mb-8'>
          <Box className='text-center mb-4'>
            <Text size="3" className='text-gray-300'>() = Points in Tie-Breaker</Text>
          </Box>

          <Flex direction="column" gap="4">
            {finalsData.map((final) => (
              // Radiux Card styling issues, used div
              <div key={final.id} className='bg-zinc-800 border border-zinc-700 rounded-lg p-4'>
                <Flex justify="between" align="center" className='!mb-4'>
                  <Badge size="3" className='!bg-lime-300 !text-black !font-bold'>
                    {final.year}
                  </Badge>
                  <Text size="2" className='text-lime-200 font-bold'>
                    Score: {final.score}
                  </Text>
                </Flex>

                <Flex direction="column" gap="3">
                  <div className='bg-zinc-900 rounded p-3'>
                    <Text size="1" className='text-gray-400 uppercase !tracking-wide !mb-2 !block'>
                      Champion
                    </Text>
                    <Text size="4" weight="bold" className='text-green-500 !block !mb-1'>
                      {final.champion_name}
                    </Text>
                    <Text size="2" className='text-white'>
                      {final.champion_country}
                    </Text>
                  </div>

                  <div className='bg-zinc-700 rounded p-3'>
                    <Text size="1" className='text-gray-400 uppercase !tracking-wide !mb-2 !block'>
                      Runner-Up
                    </Text>
                    <Text size="4" weight="bold" className='text-red-500 !block !mb-1'>
                      {final.runner_up}
                    </Text>
                    <Text size="2" className='text-white'>
                      {final.runner_up_country}
                    </Text>
                  </div>
                </Flex>
              </div>
            ))}
          </Flex>
        </Box>

        <ScrollVelocity
          texts={["AOFever"]}
          velocity={50}
          className="!mb-5 md:!mb-12 !text-white"
        />

      </Container>
    </Box>
  )
}

export default AOMensSingles
