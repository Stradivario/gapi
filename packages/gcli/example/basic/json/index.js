module.exports = async function (context) {
  const params = context.getRouteParams();
  const query = context.getQueryParams();

  return {
    status: 200,
    body: { params, query },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
};
