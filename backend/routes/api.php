<?php

use Illuminate\Http\Request;

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
    Route::resource('genres', 'GenreController', $exceptCreatEdit);
    Route::resource('cast_members', 'CastMemberController', $exceptCreatEdit);
    Route::resource('videos', 'VideoController', $exceptCreatEdit);
});
