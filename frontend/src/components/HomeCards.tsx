import React from 'react';
import { Card, Flex, Heading, Text, Button } from '@radix-ui/themes';
import { Link } from 'react-router-dom';

interface HomeCardProps {
  title: string;
  description: string;
  buttonText: string;
  linkTo: string;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  linkTo, 
}) => {
  return (
    <Card className="p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 border border-slate-200 bg-white/60 backdrop-blur-sm">
      <Flex direction="column" align="center" className="text-center">
        <Heading size={{ initial: "4", sm: "4", md: "5" }} className="pt-2 mb-2 sm:mb-3 text-slate-900">
          {title}
        </Heading>
        <Text
          size={{ initial: "2", sm: "3", md: "3" }}
          className="text-slate-600 mb-4 sm:mb-5 md:mb-6 leading-relaxed px-2 sm:px-0"
        >
          {description}
        </Text>
        <Button
          size={{ initial: "2", sm: "3", md: "3" }}
          variant="solid"
          className={`w-full transition-all`}
          asChild
        >
          <Link to={linkTo} className="no-underline">
            {buttonText}
          </Link>
        </Button>
      </Flex>
    </Card>
  );
};

export default HomeCard;
