export async function onRequest(context) {
  const { params } = context;
  const id = params.id;
  return Response.redirect(`https://xn--hzl-haber-vpbc.com/haberler/${id}`, 301);
}
