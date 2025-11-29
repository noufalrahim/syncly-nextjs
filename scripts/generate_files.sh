#!/bin/sh

NAME="$1"

FIRST="$(printf "%s" "$NAME" | cut -c1 | tr 'a-z' 'A-Z')"
REST="$(printf "%s" "$NAME" | cut -c2-)"
PASCAL_NAME="${FIRST}${REST}"
LOWER_NAME="$(printf "%s" "$NAME" | tr 'A-Z' 'a-z')"

KEBAB_NAME="$(printf "%s" "$NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr 'A-Z' 'a-z')"

ENTITY_FILE="${PASCAL_NAME}Entity"
INTERFACE_FILE="I${PASCAL_NAME}Repository"
REPO_IMPL_FILE="${PASCAL_NAME}Repository"
CONTROLLER_FILE="${PASCAL_NAME}Controller"
API_FILE="${KEBAB_NAME}s.ts"

ENTITY_PATH="../src/domain/entities/${ENTITY_FILE}.ts"
INTERFACE_PATH="../src/domain/repositories/${INTERFACE_FILE}.ts"
REPO_IMPL_PATH="../src/infrastructure/repositories/${REPO_IMPL_FILE}.ts"
CONTROLLER_PATH="../src/controllers/${CONTROLLER_FILE}.ts"
API_PATH="../src/pages/api/${API_FILE}"

mkdir -p ../src/domain/entities
mkdir -p ../src/domain/repositories
mkdir -p ../src/infrastructure/repositories
mkdir -p ../src/controllers
mkdir -p ../src/pages/api

cat > "$ENTITY_PATH" <<EOF
export class ${PASCAL_NAME} {
  constructor(
    public _id?: string,
  ) {}
}
EOF

cat > "$INTERFACE_PATH" <<EOF
import { ${PASCAL_NAME} } from "../entities/${ENTITY_FILE}";

export interface I${PASCAL_NAME}Repository {
  create(${LOWER_NAME}: ${PASCAL_NAME}): Promise<${PASCAL_NAME}>;
  find(): Promise<${PASCAL_NAME}[]>;
  findById(id: string): Promise<${PASCAL_NAME} | null>;
  update(id: string, data: Partial<${PASCAL_NAME}>): Promise<${PASCAL_NAME} | null>;
  delete(id: string): Promise<boolean>;
}
EOF

cat > "$REPO_IMPL_PATH" <<EOF
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ${PASCAL_NAME} } from "@/domain/entities/${ENTITY_FILE}";
import { I${PASCAL_NAME}Repository } from "@/domain/repositories/I${PASCAL_NAME}Repository";
import { Schema, model, models } from "mongoose";

const ${LOWER_NAME}Schema = new Schema(
  {},
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const ${PASCAL_NAME}Model =
  models.${PASCAL_NAME} || model("${PASCAL_NAME}", ${LOWER_NAME}Schema);

export class ${PASCAL_NAME}Repository implements I${PASCAL_NAME}Repository {
  async create(${LOWER_NAME}: ${PASCAL_NAME}): Promise<${PASCAL_NAME}> {
    const new${PASCAL_NAME} = await ${PASCAL_NAME}Model.create(${LOWER_NAME});
    return new${PASCAL_NAME};
  }

  async find(): Promise<${PASCAL_NAME}[]> {
    return await ${PASCAL_NAME}Model.find();
  }

  async findById(id: string): Promise<${PASCAL_NAME} | null> {
    return await ${PASCAL_NAME}Model.findById(id);
  }

  async update(id: string, data: Partial<${PASCAL_NAME}>): Promise<${PASCAL_NAME} | null> {
    return await ${PASCAL_NAME}Model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await ${PASCAL_NAME}Model.findByIdAndDelete(id);
    return result ? true : false;
  }
}
EOF

cat > "$CONTROLLER_PATH" <<EOF
import { connectDB } from "@/infrastructure/db/connect";
import { ${PASCAL_NAME}Repository } from "@/infrastructure/repositories/${REPO_IMPL_FILE}";
import { ${PASCAL_NAME} } from "@/domain/entities/${ENTITY_FILE}";

export class ${PASCAL_NAME}Controller {

  async create${PASCAL_NAME}(data: ${PASCAL_NAME}) {
    try {
      await connectDB();
      const repo = new ${PASCAL_NAME}Repository();
      const result = await repo.create(data);
      return { success: true, data: result, message: "${PASCAL_NAME} created successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to create ${NAME}" };
    }
  }

  async getAll${PASCAL_NAME}s() {
    try {
      await connectDB();
      const repo = new ${PASCAL_NAME}Repository();
      const result = await repo.find();
      return { success: true, data: result, message: "${PASCAL_NAME}s fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch ${NAME}s" };
    }
  }

  async get${PASCAL_NAME}ById(id: string) {
    try {
      await connectDB();
      const repo = new ${PASCAL_NAME}Repository();
      const result = await repo.findById(id);
      return { success: true, data: result, message: "${PASCAL_NAME} fetched successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to fetch ${NAME}" };
    }
  }

  async update${PASCAL_NAME}(id: string, data: Partial<${PASCAL_NAME}>) {
    try {
      await connectDB();
      const repo = new ${PASCAL_NAME}Repository();
      const result = await repo.update(id, data);
      return { success: true, data: result, message: "${PASCAL_NAME} updated successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to update ${NAME}" };
    }
  }

  async delete${PASCAL_NAME}(id: string) {
    try {
      await connectDB();
      const repo = new ${PASCAL_NAME}Repository();
      const result = await repo.delete(id);
      return { success: true, data: result, message: "${PASCAL_NAME} deleted successfully" };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || "Failed to delete ${NAME}" };
    }
  }
}
EOF

cat > "$API_PATH" <<EOF
import { NextApiRequest, NextApiResponse } from "next";
import { ${PASCAL_NAME}Controller } from "@/controllers/${CONTROLLER_FILE}";

const controller = new ${PASCAL_NAME}Controller();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET" && !req.query.id) {
    const route = req.query.type as string;

    if (route === "id") {
      const result = await controller.get${PASCAL_NAME}ById(req.query.id as string);
      return res.status(200).json(result);
    }

    const result = await controller.getAll${PASCAL_NAME}s();
    return res.status(200).json(result);
  }

  if (method === "POST") {
    const result = await controller.create${PASCAL_NAME}(req.body);
    return res.status(201).json(result);
  }

  if (method === "PUT") {
    const result = await controller.update${PASCAL_NAME}(req.query.id as string, req.body);
    return res.status(200).json(result);
  }

  if (method === "DELETE") {
    const result = await controller.delete${PASCAL_NAME}(req.query.id as string);
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
EOF

echo "Generated all files for: ${PASCAL_NAME}"
