import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';

export const GeoJSON = {
  TypeEnum: new GraphQLEnumType({
    name: 'GeoJSONType',
    description: 'Enumeration of all GeoJSON object types.',
    values: {
      Point: { value: 'Point' },
      MultiPoint: { value: 'MultiPoint' },
      LineString: { value: 'LineString' },
      MultiLineString: { value: 'MultiLineString' },
      Polygon: { value: 'Polygon' },
      MultiPolygon: { value: 'MultiPolygon' },
      GeometryCollection: { value: 'GeometryCollection' },
      Feature: { value: 'Feature' },
      FeatureCollection: { value: 'FeatureCollection' },
    },
  }),

  CoordinatesScalar: new GraphQLScalarType({
    name: 'GeoJSONCoordinates',
    description:
      'A (multidimensional) set of coordinates following x, y, z order.',
    serialize: coerceCoordinates,
    parseValue: coerceCoordinates,
    parseLiteral: parseCoordinates,
  }),

  JsonScalar: new GraphQLScalarType({
    name: 'JSONObject',
    description: 'Arbitrary JSON value',
    serialize: coerceObject,
    parseValue: coerceObject,
    parseLiteral: parseObject,
  }),

  PointObject: new GraphQLObjectType({
    name: 'GeoJSONPoint',
    description: 'Object describing a single geographical point.',
    interfaces: () => [GeoJSON.GeoJSONInterface, GeoJSON.GeometryInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
  }),

  MultiPointObject: new GraphQLObjectType({
    name: 'GeoJSONMultiPoint',
    description: 'Object describing multiple geographical points.',
    interfaces: () => [GeoJSON.GeoJSONInterface, GeoJSON.GeometryInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
  }),

  LineStringObject: new GraphQLObjectType({
    name: 'GeoJSONLineString',
    description:
      'Object describing a single connected sequence of geographical points.',
    interfaces: () => [GeoJSON.GeoJSONInterface, GeoJSON.GeometryInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
  }),

  MultiLineStringObject: new GraphQLObjectType({
    name: 'GeoJSONMultiLineString',
    description:
      'Object describing multiple connected sequences of geographical points.',
    interfaces: () => [GeoJSON.GeoJSONInterface, GeoJSON.GeometryInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
  }),

  PolygonObject: new GraphQLObjectType({
    name: 'GeoJSONPolygon',
    description:
      'Object describing a single shape formed by a set of geographical points.',
    interfaces: () => [GeoJSON.GeoJSONInterface, GeoJSON.GeometryInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
  }),

  MultiPolygonObject: new GraphQLObjectType({
    name: 'GeoJSONMultiPolygon',
    description:
      'Object describing multiple shapes formed by sets of geographical points.',
    interfaces: () => [GeoJSON.GeoJSONInterface, GeoJSON.GeometryInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
  }),

  GeometryCollectionObject: new GraphQLObjectType({
    name: 'GeoJSONGeometryCollection',
    description: 'A set of multiple geometries, possibly of various types.',
    interfaces: () => [GeoJSON.GeoJSONInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      geometries: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GeoJSON.GeometryInterface)),
        ),
      },
    }),
  }),

  FeatureObject: new GraphQLObjectType({
    name: 'GeoJSONFeature',
    description:
      'An object that links a geometry to properties in order to provide context.',
    interfaces: () => [GeoJSON.GeoJSONInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      geometry: { type: GeoJSON.GeometryInterface },
      properties: { type: GeoJSON.JsonScalar },
      id: { type: GraphQLString },
    }),
  }),

  FeatureCollectionObject: new GraphQLObjectType({
    name: 'GeoJSONFeatureCollection',
    description: 'A set of multiple features.',
    interfaces: () => [GeoJSON.GeoJSONInterface],
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      features: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GeoJSON.FeatureObject)),
        ),
      },
    }),
  }),

  CRSTypeEnum: new GraphQLEnumType({
    name: 'GeoJSONCRSType',
    description: 'Enumeration of all GeoJSON CRS object types.',
    values: {
      name: { value: 'name' },
      link: { value: 'link' },
    },
  }),

  NamedCRSPropertiesObject: new GraphQLObjectType({
    name: 'GeoJSONNamedCRSProperties',
    description: 'Properties for name based CRS object.',
    fields: () => ({
      name: { type: new GraphQLNonNull(GraphQLString) },
    }),
  }),

  LinkedCRSPropertiesObject: new GraphQLObjectType({
    name: 'GeoJSONLinkedCRSProperties',
    description: 'Properties for link based CRS object.',
    fields: () => ({
      href: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: GraphQLString },
    }),
  }),

  CRSPropertiesUnion: new GraphQLUnionType({
    name: 'GeoJSONCRSProperties',
    description: 'CRS object properties.',
    types: () => [
      GeoJSON.NamedCRSPropertiesObject,
      GeoJSON.LinkedCRSPropertiesObject,
    ],
    resolveType: (value) => {
      if (value.name) return GeoJSON.NamedCRSPropertiesObject;
      if (value.href) return GeoJSON.LinkedCRSPropertiesObject;
    },
  }),

  CoordinateReferenceSystemObject: new GraphQLObjectType({
    name: 'GeoJSONCoordinateReferenceSystem',
    description: 'Coordinate Reference System (CRS) object.',
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.CRSTypeEnum) },
      properties: { type: new GraphQLNonNull(GeoJSON.CRSPropertiesUnion) },
    }),
  }),

  GeoJSONInterface: new GraphQLInterfaceType({
    name: 'GeoJSONInterface',
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
    }),
    resolveType: (value) => GeoJSON[`${value.type}Object`],
  }),

  GeometryInterface: new GraphQLInterfaceType({
    name: 'GeoJSONGeometryInterface',
    fields: () => ({
      type: { type: new GraphQLNonNull(GeoJSON.TypeEnum) },
      crs: {
        type: new GraphQLNonNull(GeoJSON.CoordinateReferenceSystemObject),
      },
      bbox: { type: new GraphQLList(GraphQLFloat) },
      coordinates: { type: GeoJSON.CoordinatesScalar },
    }),
    resolveType: (value) => GeoJSON[`${value.type}Object`],
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coerceCoordinates(value: any) {
  return value;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCoordinates(valueAST: any) {
  return valueAST.value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coerceObject(value: any) {
  return JSON.parse(value);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseObject(valueAST: any) {
  return JSON.stringify(valueAST.value);
}
