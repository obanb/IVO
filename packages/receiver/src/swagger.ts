const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'IVO',
            version: '0.0.0',
        },
    },
    apis: [__filename],
};

const url = '/api/docs';

/**
 * @openapi
 *  /api/hoteltime:
 *    post:
 *      description: HotelTime receiver gateway
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                datatype:
 *                  type: string
 *                  example: "Created"
 *      responses:
 *        200:
 *          description: OK
 *        400:
 *          description: Bad Request
 */

export const swagger = {
    options,
    url,
};
