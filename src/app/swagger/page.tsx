import { getApiDocs } from "swagger";
import ReactSwaggerUI from "./swagger-ui";

export default async function SwaggerPage() {
    const spec = await getApiDocs();

    return (
        <section>
            <ReactSwaggerUI spec={spec} />
        </section>
    )
}
