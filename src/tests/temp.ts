import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '../routers/_app'

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8000/trpc',
      headers: () => {
        return { Authorization: 'eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiZW5jLTIwMjMtMDUtMTFUMDk6NTE6NThaIn0.b8dWdnZSiCQxrY9zvmQhiy0bEnQLVrLIFUAK0nkwmc-E56chkgOF5dLcY6BUFpTAzwciHZMNtm96Ty22wTp9TxdtvxGcwfhOisbVfHVle8cSsuvVVhM-uNCUtSM9XTvaKxc_h2mGFJUcPy_cgRg6fKbfYnPeyd10bCKwMoRFpXN4_vcS_DHeid8o7ULfaBESZ1GmTX6i013vTnxXtciBRS_qly8ZjKl68tx3HN3urqMu3TW3b2_QkcW4P6KgBivudbWhy9VyHqmtz7gNAJhItpb_I5dy_hEJX7GUuVT6_jJDq9WleNG42P-YfF52hFsli17NH1c9PEPgIeVbr8F0gw.VHExAK2gtvLVl1L5.yd021P8VnlxZ4os8chago274kDJQ_IFkVe8Owx9Y8lzVCvl74-txU1lQgJ_tmj_wjZ5hOLjLXh0za9tpBtrFiDAio8YG-eMi0ymcJ-9Tp_wWcLngNqX_yaAVMjr3DKItUTAV6bEL7j9wmd5_qBUnZZlP7-14-uohI35jBwHf8Tjo6Ft32YDUvCIUh5NNoPvkge31oUF_2qNJ5SeDU9W4ouEro8VNUgqHIdsNe6zf5dJAHoigi-tlJTRy6mnaQ_Urx7e8MYcdwpdRVTMMGO8FRt2rKAJpGE0xNMNqUSEa8QSTb7cpGYJjyJDxZMEf2wypq61RvkPpple-oY6U4FWS_LT78NyoRYwB3K4OfGOGX4lXvjahp_I0D8M8wdQ0wMsiQGIyGwGTvQTZHJzGfq6n66uO8nndzS6YEbo3V5ECXDyYEtvehVfvBkRo_UFyWIxLh0CJnef6xCV2EX0Hqtg6tEMCA6rLe3NZgUUglmvWCmxE9U5EUuSw84NLWjkASJN2gwcpAsaUo8Wwuv1rx0aSrp3S6lcJy1Nqwy_aYpTkUyaKphj9Znwaaw3CFknes7Xzzk2mi8oksPYuEIHTMPLFQRe1I5cICMth59jEFxWCK_UXmGkWJHlLTcDcop18rN-E_DMk0Wrd-7zkY4b8lQesd0d3bsSveFARfLdLd2jo85toshlmTW7JNh3nvA7dX_ZnXN2ziLa64RhAwwMXdultCbOjFCE2P0vynqsitTwbnu8.3Tdvx9z7D-jlfHqEBtTHUw' }
      },
    }),
  ],
  transformer: superjson,
})

const _data = await client.user.register.mutate({ id: '1', password: '1', username: '123', role: 'student' })
