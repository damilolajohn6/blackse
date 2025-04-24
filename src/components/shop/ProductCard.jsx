"use client";

import Link from "next/link";
import { Typography, Card, CardContent, CardMedia } from "@mui/material";

const ProductCard = ({ product }) => {
  return (
    <Link href={`/product/${product._id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        {product.images?.[0]?.url ? (
          <CardMedia
            component="img"
            height="200"
            image={product.images[0].url}
            alt={product.name}
            className="object-cover"
          />
        ) : (
          <div className="h-[200px] bg-gray-200 flex items-center justify-center">
            <Typography>No Image</Typography>
          </div>
        )}
        <CardContent>
          <Typography variant="h6" className="font-semibold truncate">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.category}
          </Typography>
          <Typography variant="body1" className="font-medium">
            $
            {product.discountPrice?.toFixed(2) ||
              product.originalPrice?.toFixed(2)}
            {product.originalPrice &&
              product.discountPrice < product.originalPrice && (
                <span className="text-gray-500 line-through ml-2">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock: {product.stock || 0}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
