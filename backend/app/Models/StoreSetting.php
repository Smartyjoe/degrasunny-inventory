<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'store_name',
        'store_logo',
    ];

    /**
     * Get the user that owns the store settings.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
