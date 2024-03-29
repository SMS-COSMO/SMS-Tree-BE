import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PutObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { publicProcedure, router } from '../trpc';
import { env } from '../env';

export const s3Router = router({
    getStandardUploadPresignedUrl: publicProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { key } = input;
            const { s3 } = ctx;

            const putObjectCommand = new PutObjectCommand({
                Bucket: env.BUCKET_NAME,
                Key: key,
            });

            return await getSignedUrl(s3, putObjectCommand);
        }),
    getMultipartUploadPresignedUrl: publicProcedure
        .input(z.object({ key: z.string(), filePartTotal: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const { key, filePartTotal } = input;
            const { s3 } = ctx;

            const uploadId = (
                await s3.createMultipartUpload({
                    Bucket: env.BUCKET_NAME,
                    Key: key,
                })
            ).UploadId;

            if (!uploadId) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '创建上传任务失败',
                });
            }

            const urls: Promise<{ url: string; partNumber: number }>[] = [];

            for (let i = 1; i <= filePartTotal; i++) {
                const uploadPartCommand = new UploadPartCommand({
                    Bucket: env.BUCKET_NAME,
                    Key: key,
                    UploadId: uploadId,
                    PartNumber: i,
                });

                const url = getSignedUrl(s3, uploadPartCommand).then(url => ({
                    url,
                    partNumber: i,
                }));

                urls.push(url);
            }

            return {
                uploadId,
                urls: await Promise.all(urls),
            };
        }),
    completeMultipartUpload: publicProcedure
        .input(
            z.object({
                key: z.string(),
                uploadId: z.string(),
                parts: z.array(
                    z.object({
                        ETag: z.string(),
                        PartNumber: z.number(),
                    }),
                ),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { key, uploadId, parts } = input;
            const { s3 } = ctx;

            const completeMultipartUploadOutput = await s3.completeMultipartUpload({
                Bucket: env.BUCKET_NAME,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts,
                },
            });

            return completeMultipartUploadOutput;
        }),
});
