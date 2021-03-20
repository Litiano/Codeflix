<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['namespace' => 'Api', 'as' => 'api.'], function () {
    $exceptCreatEdit = ['except' => ['create', 'edit']];

    Route::resource('categories', 'CategoryController', $exceptCreatEdit);
    Route::delete('categories', 'CategoryController@destroyCollection');

    Route::resource('genres', 'GenreController', $exceptCreatEdit);
    Route::delete('genres', 'GenreController@destroyCollection');

    Route::resource('cast_members', 'CastMemberController', $exceptCreatEdit);
    Route::delete('cast_members', 'CastMemberController@destroyCollection');

    Route::resource('videos', 'VideoController', $exceptCreatEdit);
    Route::delete('videos', 'VideoController@destroyCollection');
});
