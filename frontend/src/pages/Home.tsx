import "@radix-ui/themes/styles.css";
import { Container, Theme, Heading, Flex, Button, Box, Text, Card, Grid } from '@radix-ui/themes';
import Header from "../components/Header";
import HomeCard from "../components/HomeCards";
import ScrollVelocity from "../components/ScrollVelocity";

const Home = () => {
    return (
        <Box>
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <Box className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Container className="py-8 px-4 sm:py-12 md:py-16">
                    <Box className="text-center mb-8 sm:mb-10 md:mb-12">
                        <Heading
                            as="h1"
                            size={{ initial: "7", sm: "8", md: "9" }}
                            className="bg-gradient-to-r from-crimson-11 to-orange-11 bg-clip-text font-bold leading-tight"
                        >
                            Welcome to
                        </Heading>

                        <ScrollVelocity
                        texts={["AOFever"]}
                        velocity={50}
                        className="mb-5 md:mb-12"
                        />

                        <Text
                            size={{ initial: "3", sm: "5", md: "6" }}
                            className="text-slate-600 mb-6 sm:mb-7 md:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
                        >
                            Your ultimate destination for everything Australian Open! Follow the action, stats, and excitement.
                        </Text>
                    </Box>

                    {/* Cards */}
                    <Grid
                        columns={{ initial: "1", sm: "1", md: "2" }}
                        gap={{ initial: "4", sm: "5", md: "6" }}
                        className="max-w-xs sm:max-w-lg md:max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4 sm:px-0"
                    >
                        <HomeCard
                            title="Men's Singles"
                            description="Follow the top ATP players as they compete for the Australian Open title"
                            buttonText="View Men's Draw"
                            linkTo="/aomenssingles"
                            gradientColors="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        />

                        <HomeCard
                            title="Men's Doubles"
                            description="Watch the ATP's finest compete in the premier Grand Slam tournament"
                            buttonText="View Men's Doubles Draw"
                            linkTo="/aomensdoubles"
                            gradientColors="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        />

                        <HomeCard
                            title="Women's Singles"
                            description="Watch the WTA's finest compete in the premier Grand Slam tournament"
                            buttonText="View Women's Singles Draw"
                            linkTo="/aowomenssingles"
                            gradientColors="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        />

                        <HomeCard
                            title="Women's Doubles"
                            description="Watch the WTA's finest compete in the premier Grand Slam tournament"
                            buttonText="View Women's Doubles Draw"
                            linkTo="/aowomensdoubles"
                            gradientColors="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        />

                    </Grid>
                </Container>
            </Box>
        </Box>
    )
}

export default Home
