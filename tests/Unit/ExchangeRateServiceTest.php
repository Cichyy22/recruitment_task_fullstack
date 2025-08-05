<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Service\ExchangeRateService;
use PHPUnit\Framework\TestCase;

class ExchangeRateServiceTest extends TestCase
{
    private ExchangeRateService $service;

    protected function setUp(): void
    {
        $this->service = new ExchangeRateService();
    }

    public function testGetTodayRatesReturnsExpectedStructure(): void
    {
        $rates = $this->service->getTodayRates();

        $this->assertIsArray($rates);

        foreach ($rates as $code => $rateData) {
            $this->assertArrayHasKey('code', $rateData);
            $this->assertArrayHasKey('name', $rateData);
            $this->assertArrayHasKey('mid', $rateData);
            $this->assertEquals($code, $rateData['code']);

            if (in_array($code, ['EUR', 'USD'])) {
                $this->assertArrayHasKey('buy', $rateData);
                $this->assertArrayHasKey('sell', $rateData);
                $this->assertIsFloat($rateData['buy']);
                $this->assertIsFloat($rateData['sell']);
                $this->assertEquals(
                    round($rateData['mid'] - 0.15, 4),
                    $rateData['buy']
                );
                $this->assertEquals(
                    round($rateData['mid'] + 0.11, 4),
                    $rateData['sell']
                );
            } else {
                $this->assertArrayHasKey('sell', $rateData);
                $this->assertIsFloat($rateData['sell']);
                $this->assertEquals(
                    round($rateData['mid'] + 0.2, 4),
                    $rateData['sell']
                );
            }
        }
    }

    public function testGetHistoricalRatesValidCurrency(): void
    {
        $endDate = '2025-06-30';
        $currency = 'EUR';
        $rates = $this->service->getHistoricalRates($currency, $endDate);

        $this->assertIsArray($rates);
        $this->assertNotEmpty($rates);

        foreach ($rates as $rate) {
            $this->assertArrayHasKey('date', $rate);
            $this->assertArrayHasKey('sell', $rate);
            $this->assertArrayHasKey('name', $rate);
            $this->assertArrayHasKey('code', $rate);
            $this->assertEquals($currency, $rate['code']);

            $this->assertRegExp('/^\d{4}-\d{2}-\d{2}$/', $rate['date']);

            if (in_array($currency, ['EUR', 'USD'])) {
                $this->assertArrayHasKey('buy', $rate);
                $this->assertIsFloat($rate['buy']);
                $this->assertIsFloat($rate['sell']);
            } else {
                $this->assertArrayNotHasKey('buy', $rate);
                $this->assertIsFloat($rate['sell']);
            }
        }
    }

    public function testGetHistoricalRatesInvalidCurrency(): void
    {
        $result = $this->service->getHistoricalRates('XXX', '2025-06-30');

        $this->assertIsArray($result);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Unsupported currency', $result['error']);
    }

    public function testGetHistoricalRatesInvalidDate(): void
    {
        $result = $this->service->getHistoricalRates('EUR', 'invalid-date');

        $this->assertIsArray($result);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Invalid date format. Use YYYY-MM-DD.', $result['error']);
    }
}
