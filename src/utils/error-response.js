export const catchError = (res, code, err) => {
    return res.status(code).json({
        statusCode: code,
        message: err
    });
}