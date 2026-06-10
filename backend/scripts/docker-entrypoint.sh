#!/bin/sh
set -e

echo "Applying schema from schema.prisma..."
bunx prisma db push

echo "Generating Prisma client..."
bunx prisma generate

echo "Starting DriftLogg API..."
exec bun dist/index.js
