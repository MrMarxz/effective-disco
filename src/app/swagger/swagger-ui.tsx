/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

type Props = {
    spec: Record<string, any>;
}

function ReactSwaggerUI({ spec }: Props) {

    return (
        <SwaggerUI spec={spec} />
    );
}

export default ReactSwaggerUI;
