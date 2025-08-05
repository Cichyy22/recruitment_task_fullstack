<?php

namespace App\Service;

use GuzzleHttp\Client;

class ExchangeRateService
{
    private array $currencies = ['EUR', 'USD', 'CZK', 'IDR', 'BRL'];
    private string $apiBase = 'https://api.nbp.pl/api/exchangerates/';
    private Client $client;

    public function __construct()
    {
        $this->client = new Client([
            'headers' => ['Accept' => 'application/json']
        ]);
    }

    public function getTodayRates(): array
{
    $results = [];
    $response = $this->client->get($this->apiBase . 'tables/A/?format=json');
    $data = json_decode($response->getBody()->getContents(), true)[0]['rates'];

    foreach ($data as $item) {
        $code = $item['code'];
        if (in_array($code, $this->currencies)) {
            $mid = $item['mid'];
            $name = $item['currency'];

            $baseData = [
                'code' => $code,
                'name' => $name,
                'mid' => $mid,
            ];

            if (in_array($code, ['EUR', 'USD'])) {
                $results[$code] = array_merge($baseData, [
                    'buy' => round($mid - 0.15, 4),
                    'sell' => round($mid + 0.11, 4),
                ]);
            } else {
                $results[$code] = array_merge($baseData, [
                    'sell' => round($mid + 0.2, 4),
                ]);
            }
        }
    }

    return $results;
}

    public function getHistoricalRates(string $currency, string $date): array //date == end
    {
        if (!in_array($currency, $this->currencies)) {
            return ['error' => 'Unsupported currency'];
        }
        $endDate = \DateTime::createFromFormat('Y-m-d', $date);
        if (!$endDate) {
            return ['error' => 'Invalid date format. Use YYYY-MM-DD.'];
        }

       
        $startDate = clone $endDate;
        $startDate->modify('-14 days');

        $startFormatted = $startDate->format('Y-m-d');
        $endFormatted = $endDate->format('Y-m-d');

       
        $url = "{$this->apiBase}rates/A/{$currency}/{$startFormatted}/{$endFormatted}/?format=json";
        // $url = "{$this->apiBase}rates/A/{$currency}/last/14/?endDate={$date}&format=json";
        $response = $this->client->get($url);
        $data = json_decode($response->getBody()->getContents(), true);

        $currencyName = $data['currency'] ?? $currency;
        $currencyCode = $data['code'] ?? $currency;
        $rates = [];
        foreach ($data['rates'] as $rate) {
            $mid = $rate['mid'];
            if (in_array($currency, ['EUR', 'USD'])) {
                $rates[] = [
                    'date' => $rate['effectiveDate'],
                    'buy' => round($mid - 0.15, 4),
                    'sell' => round($mid + 0.11, 4),
                    'name' => $currencyName,
                    'code' => $currencyCode,
                ];
            } else {
                $rates[] = [
                    'date' => $rate['effectiveDate'],
                    'sell' => round($mid + 0.2, 4),
                    'name' => $currencyName,
                    'code' => $currencyCode,
                ];
            }
        }

        return $rates;
    }
}