<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexTravelPackageRequest;
use App\Http\Requests\StoreTravelPackageRequest;
use App\Http\Requests\UpdateTravelPackageRequest;
use App\Http\Resources\TravelPackageResource;
use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TravelPackageController extends Controller
{
    public function index(IndexTravelPackageRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = TravelPackage::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $query) use ($search): void {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%");
            });
        }

        foreach (['destination', 'status'] as $filter) {
            if (isset($filters[$filter])) {
                $query->where($filter, $filters[$filter]);
            }
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (isset($filters['duration_days'])) {
            $query->where('duration_days', $filters['duration_days']);
        }

        return TravelPackageResource::collection(
            $query->orderBy('id')->paginate($filters['per_page'] ?? 15)->withQueryString(),
        );
    }

    public function store(StoreTravelPackageRequest $request): JsonResponse
    {
        $travelPackage = TravelPackage::create($request->validated());

        return (new TravelPackageResource($travelPackage))
            ->response()
            ->setStatusCode(201);
    }

    public function show(TravelPackage $package): TravelPackageResource
    {
        return new TravelPackageResource($package);
    }

    public function update(UpdateTravelPackageRequest $request, TravelPackage $package): TravelPackageResource
    {
        $package->update($request->validated());

        return new TravelPackageResource($package->refresh());
    }

    public function destroy(TravelPackage $package): JsonResponse
    {
        $package->delete();

        return response()->json(status: 204);
    }
}
