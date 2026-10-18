<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated())->refresh();

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user,
            'token' => $user->createToken('tripease-token')->plainTextToken,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $user->createToken('tripease-token')->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }
}
