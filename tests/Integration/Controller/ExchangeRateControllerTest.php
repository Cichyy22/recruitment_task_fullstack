<?php

declare(strict_types=1);

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ExchangeRateControllerTest extends WebTestCase
{
    public function testGetTodayRates(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/rates/today');
        $response = $client->getResponse();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        // echo $response->getContent();
        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('EUR', $responseData);
        $this->assertArrayHasKey('USD', $responseData);
    }

    public function testGetHistoricalRatesValidCurrency(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/rates/history/EUR/2025-06-30');
        $response = $client->getResponse();
        // echo $response->getContent();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertIsArray($responseData);
        $this->assertNotEmpty($responseData);
        $this->assertArrayHasKey('date', $responseData[0]);
        $this->assertArrayHasKey('sell', $responseData[0]);
        $this->assertArrayHasKey('name', $responseData[0]);
        $this->assertArrayHasKey('code', $responseData[0]);
    }

    public function testGetHistoricalRatesInvalidCurrency(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/rates/history/XXX/2025-06-30');

        $this->assertEquals(400, $client->getResponse()->getStatusCode());

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('error', $responseData);
    }

    public function testGetHistoricalRatesInvalidDate(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/rates/history/EUR/invalid-date');

        $this->assertEquals(400, $client->getResponse()->getStatusCode());

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('error', $responseData);
    }
}