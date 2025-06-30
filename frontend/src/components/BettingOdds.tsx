import { useState } from 'react'
import { Box, Checkbox, Flex, TextField, Text } from '@radix-ui/themes'

interface BettingOddsProps {
    onOddsChange?: (odds: { player1Odds: string; player2Odds: string; enabled: boolean }) => void
}

const BettingOdds = ({ onOddsChange }: BettingOddsProps) => {
    const [showOdds, setShowOdds] = useState(false)
    const [player1Odds, setPlayer1Odds] = useState('')
    const [player2Odds, setPlayer2Odds] = useState('')

    // Send current odds data to parent component
    const sendOddsToParent = () => {
        if (onOddsChange) {
            onOddsChange({
                player1Odds,
                player2Odds,
                enabled: showOdds
            })
        }
    }

    // Make sure input is 2 decimal places
    const isValidOddsInput = (value: string): boolean => {
        if (value === '') return true

        const positiveDecimalRegex = /^(?:0(?:\.\d{0,2})?|[1-9]\d*(?:\.\d{0,2})?)$/

        if (!positiveDecimalRegex.test(value)) return false

        const numValue = parseFloat(value)
        return numValue > 0 || value === '0.' || value === '0.0' || value === '0.00'
    }

    const handlePlayer1OddsChange = (value: string) => {
        if (isValidOddsInput(value)) {
            setPlayer1Odds(value)
            setTimeout(() => sendOddsToParent(), 0)
        }
    }

    const handlePlayer2OddsChange = (value: string) => {
        if (isValidOddsInput(value)) {
            setPlayer2Odds(value)
            setTimeout(() => sendOddsToParent(), 0)
        }
    }

    const handleCheckboxChange = (checked: boolean) => {
        setShowOdds(checked)
        setTimeout(() => sendOddsToParent(), 0)
    }

    return (
        <Box>
            <Flex align="center" gap="2" mb="3">
                <Text className='text-white'>Specify Odds?</Text>
                <Checkbox
                    checked={showOdds}
                    onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
                />
            </Flex>

            {showOdds && (
                <Flex gap="3">
                    <Box>
                        <Text as="label" size="2" mb="1">
                            Player 1 Odds
                        </Text>
                        <TextField.Root
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g., 1.55"
                            value={player1Odds}
                            onChange={(e) => handlePlayer1OddsChange(e.target.value)}
                        />
                    </Box>

                    <Box>
                        <Text as="label" size="2" mb="1">
                            Player 2 Odds
                        </Text>
                        <TextField.Root
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g., 2.75"
                            value={player2Odds}
                            onChange={(e) => handlePlayer2OddsChange(e.target.value)}
                        />
                    </Box>
                </Flex>
            )}
        </Box>
    )
}

export default BettingOdds
