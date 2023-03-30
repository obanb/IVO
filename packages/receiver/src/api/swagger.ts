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

/**
 * @openapi
 *  /api/service/resendByRange:
 *    post:
 *      description: resend HotelTime msg to queque by msg number range
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                from:
 *                  type: number
 *                  example: 1
 *                to:
 *                  type: number
 *                  example: 5
 *      responses:
 *        200:
 *          description: OK
 *        400:
 *          description: Bad Request
 */

/**
 * @openapi
 *  /api/service/resendByNumber:
 *    post:
 *      description: resend HotelTime msg to queque by msg number
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                number:
 *                  type: number
 *                  example: 1
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
