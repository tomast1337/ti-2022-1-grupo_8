export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

export const notFound = (what: string) =>
    new HttpError(404, `${what} not found`);
