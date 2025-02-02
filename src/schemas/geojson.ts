import * as z from "zod";

const GeometryTypes = z.enum([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
]);

// Position Schema
const PositionSchema = z
  .array(z.number())
  .refine((arr) => arr.length >= 2 && arr.length <= 3, {
    message: "Position must have 2 or 3 elements",
  }) satisfies z.ZodType<GeoJSON.Position>;

// BBox Schema
const BBoxSchema = z.union([
  z.tuple([z.number(), z.number(), z.number(), z.number()]),
  z.tuple([
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
  ]),
]) satisfies z.ZodType<GeoJSON.BBox>;

// Base GeoJSON Object Schema
const GeoJsonObjectSchema = z.object({
  type: GeometryTypes,
  bbox: BBoxSchema.optional(),
}) satisfies z.ZodType<GeoJSON.GeoJsonObject>;

// Point Schema
const PointSchema = GeoJsonObjectSchema.extend({
  type: z.literal("Point"),
  coordinates: PositionSchema,
}) satisfies z.ZodType<GeoJSON.Point>;

// MultiPoint Schema
const MultiPointSchema = GeoJsonObjectSchema.extend({
  type: z.literal("MultiPoint"),
  coordinates: z.array(PositionSchema),
}) satisfies z.ZodType<GeoJSON.MultiPoint>;

// LineString Schema
const LineStringSchema = GeoJsonObjectSchema.extend({
  type: z.literal("LineString"),
  coordinates: z.array(PositionSchema),
}) satisfies z.ZodType<GeoJSON.LineString>;

// MultiLineString Schema
const MultiLineStringSchema = GeoJsonObjectSchema.extend({
  type: z.literal("MultiLineString"),
  coordinates: z.array(z.array(PositionSchema)),
}) satisfies z.ZodType<GeoJSON.MultiLineString>;

// Polygon Schema
const PolygonSchema = GeoJsonObjectSchema.extend({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(PositionSchema)),
}) satisfies z.ZodType<GeoJSON.Polygon>;

// MultiPolygon Schema
const MultiPolygonSchema = GeoJsonObjectSchema.extend({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(PositionSchema))),
}) satisfies z.ZodType<GeoJSON.MultiPolygon>;

// // GeometryCollection Schema
// const GeometryCollectionSchema = GeoJsonObjectSchema.extend({
//   type: z.literal("GeometryCollection"),
//   geometries: z.lazy(() => z.array(GeometrySchema)),
// }) satisfies z.ZodType<GeoJSON.GeometryCollection>;

// Union of all Geometry types
const GeometrySchema = z.union([
  PointSchema,
  MultiPointSchema,
  LineStringSchema,
  MultiLineStringSchema,
  PolygonSchema,
  MultiPolygonSchema,
  //   GeometryCollectionSchema,
]) satisfies z.ZodType<GeoJSON.Geometry>;

// Properties Schema
const GeoJsonPropertiesSchema = z
  .record(z.any())
  .nullable() satisfies z.ZodType<GeoJSON.GeoJsonProperties>;

// Feature Schema
const FeatureSchema = GeoJsonObjectSchema.extend({
  type: z.literal("Feature"),
  geometry: GeometrySchema,
  id: z.union([z.string(), z.number()]).optional(),
  properties: GeoJsonPropertiesSchema,
}) satisfies z.ZodType<GeoJSON.Feature>;

// FeatureCollection Schema
const FeatureCollectionSchema = GeoJsonObjectSchema.extend({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
}) satisfies z.ZodType<GeoJSON.FeatureCollection>;

// GeoJSON Schema (union of all possible types)
const GeoJSONSchema = z.union([
  GeometrySchema,
  FeatureSchema,
  FeatureCollectionSchema,
]);

export {
  PositionSchema,
  BBoxSchema,
  GeoJsonObjectSchema,
  PointSchema,
  MultiPointSchema,
  LineStringSchema,
  MultiLineStringSchema,
  PolygonSchema,
  MultiPolygonSchema,
  //   GeometryCollectionSchema,
  GeometrySchema,
  GeoJsonPropertiesSchema,
  FeatureSchema,
  FeatureCollectionSchema,
  GeoJSONSchema,
};
