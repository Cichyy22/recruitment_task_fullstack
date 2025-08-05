<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Service\ExchangeRateService;
use GuzzleHttp\Exception\RequestException;
use InvalidArgumentException;
use Exception;

class ExchangeRateController
{
    private ExchangeRateService $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        $this->exchangeRateService = $exchangeRateService;
    }

    #[Route('/api/rates/today', methods: ['GET'])]
    public function getTodayRates(): JsonResponse
    {
        try {
            $data = $this->exchangeRateService->getTodayRates();
            return new JsonResponse($data, Response::HTTP_OK);
        } catch (RequestException $e) {
            return new JsonResponse([
                'error' => 'Failed to fetch data from NBP API',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_GATEWAY);
        } catch (Exception $e) {
            return new JsonResponse([
                'error' => 'Internal server error',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/rates/history/{currency}/{date}', methods: ['GET'])]
    public function getHistoricalRates(string $currency, string $date): JsonResponse
    {
        try {
            if (!preg_match('/^[A-Z]{3}$/', $currency)) {
                throw new InvalidArgumentException('Invalid currency code format.');
            }

            if (!\DateTime::createFromFormat('Y-m-d', $date)) {
                throw new InvalidArgumentException('Invalid date format. Use YYYY-MM-DD.');
            }

            $data = $this->exchangeRateService->getHistoricalRates($currency, $date);

            if (isset($data['error'])) {
                return new JsonResponse($data, Response::HTTP_BAD_REQUEST);
            }

            return new JsonResponse($data, Response::HTTP_OK);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse([
                'error' => 'Invalid request parameters',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (RequestException $e) {
            return new JsonResponse([
                'error' => 'Failed to fetch data from NBP API',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_GATEWAY);
        } catch (Exception $e) {
            return new JsonResponse([
                'error' => 'Internal server error',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
