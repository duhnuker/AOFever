import { Container, Heading, Flex, Box} from '@radix-ui/themes';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <Box className="border-b border-zinc-800 bg-zinc-700 backdrop-blur-sm sticky top-0 z-10">
            <Container>
                <Flex justify="between" align="center" className="py-3 px-4">
                    <Heading size={{ initial: "6", sm: "7" }} as="h1" className="font-bold">
                        <Link to="/" className="text-white no-underline font-serif">
                            AOFever
                        </Link>
                    </Heading>
                </Flex>
            </Container>
        </Box>
    )
}

export default Header