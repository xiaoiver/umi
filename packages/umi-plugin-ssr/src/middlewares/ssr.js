export default function(service, renderer) {
  return async function(req, res, next) {
    let url = req.url;
    let errorHandler = err => next(err);

    let { err, html } = await renderer.render({
      url,
      req,
      res,
      error: errorHandler,
    });

    if (err) {
      return next(err);
    }
    res.end(html);
  };
}
