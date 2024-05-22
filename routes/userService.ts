//import sql from "../lib/db";
import { pool } from "../lib/bdpg";
//tirar pasta route, próxima versao
import { Request, Response, Router } from "express";
import { z } from "zod";

const Ccc = z.object({
  id: z.number().optional(),
  sss: z.string().min(1),
  xxx: z.number().optional()
});

const BbbSchema = z.object({
  id: z.number().optional(),
  ttt: z.string().min(1),
  ccc: Ccc.optional()
});

// extract the inferred type like this
type Bbb = z.infer<typeof BbbSchema>;

const AaaSchema = z.object({
  rrr: z.string().min(1),
  bbb: BbbSchema,
});

type Aaa = z.infer<typeof AaaSchema>;


export async function saveAuthorAddress(req: Request, res: Response) {
  const client = await pool.connect();
  const author = req.body;
  console.log(author);
  try {
    await client.query("BEGIN");
    const authorData = await client.query(
      `INSERT INTO bbbs (ttt) VALUES ('${author.ttt}') RETURNING id `,
    );
    console.log(authorData.rows[0].id);
    const cursoData = await client.query(
      `INSERT INTO cccs (sss, xxx, bbb_id) VALUES ('${author.ccc.sss}', '${author.ccc.xxx}', '${authorData.rows[0].id}')`,
    );
    await client.query("COMMIT");
    res.status(201).json({ message: 'Gravado com Sucesso'});
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}

export async function saveMonography(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const monography = AaaSchema.parse(req.body);
    console.log(monography);
    const save = await client.query(
      `insert INTO aaas (rrr, bbb_id) VALUES ('${monography.rrr}', '${monography.bbb.id}' ) RETURNING *`,
    );
    console.log(save.rows[0]);
    res.status(201).json(save.rows[0]);
    //res.send("Estudante Salvo");
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(400).json({ error });
  } finally {
    client.release();
  }
}


export async function allAuthors(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const authors = await client.query(`SELECT b.id, b.ttt, 
    json_build_object('id', c.id, 'sss', c.sss, 'xxx', c.xxx) as ccc FROM cccs c
    INNER JOIN bbbs b ON c.bbb_id = b.id`);
    res.send(authors.rows);
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}

export async function allMonographs(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const monographs = await client.query(`SELECT a.id, a.rrr, 
    json_build_object('id', b.id, 'ttt', b.ttt) as bbb FROM bbbs b
    INNER JOIN aaas a ON a.bbb_id = b.id`);
    res.send(monographs.rows);
  } catch (error) {
    console.log("Erro  na Busca:" + error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}


// export async function saveAuthor(req: Request, res: Response) {
//   const client = await pool.connect();
//   try {
//     const author = Author.parse(req.body);

//     console.log(author.name);
//     console.log(typeof author.name);
//     const courseSave = await client.query(
//       `insert INTO authors (name) VALUES ('${author.name}') RETURNING *`,
//     );
//     console.log(courseSave.rows[0]);
//     res.status(201).json(courseSave.rows[0]);
//   } catch (error) {
//     console.error("Erro durante a Busca:", error);
//     return res.status(400).json({ error });
//     //res.status(400).json({ message: 'Dados inválidos', error: error.errors });
//   } finally {
//     client.release();
//   }
// }
export const getAuthorById = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const course = await client.query(`SELECT * FROM authors WHERE id = ${id}`);
    if (course.rowCount === 0) {
      return res.status(404).json({ message: "Author não encontrado" });
    }
    return res.status(200).json(course.rows[0]);
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
};



export const getMonographyById = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const course = await client.query(
      `SELECT * FROM monographs WHERE id = ${id}`,
    );
    if (course.rowCount === 0) {
      return res.status(404).json({ message: "Monografia não encontrada" });
    }
    return res.status(200).json(course.rows[0]);
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
};

export async function listSubject(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const subjects = await client.query(`select * from subjects`);
    res.send(subjects.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}
export async function saveSubject(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const subject = req.body;
    console.log(subject.name + subject.course.id);
    const save = await client.query(
      `insert INTO subjects (name, course_id) VALUES ('${subject.name}','${subject.coourse.id}')`,
    );
    res.send("Curso Salvo");
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}

export async function saveProfessor(req: Request, res: Response) {
  const client = await pool.connect();
  const professor = req.body;
  console.log(professor);
  try {
    await client.query("BEGIN");
    const professorData = await client.query(
      `INSERT INTO professors (name, email, year_birth, number_contract) VALUES ('${professor.name}', '${professor.email}', '${professor.yearBirth}', '${professor.numberContract}') RETURNING id `,
    );
    console.log(professorData.rows[0].id);
    const cursoData = await client.query(
      `INSERT INTO addresses (street, number, professor_id) VALUES ('${professor.address.street}', '${professor.address.number}', '${professorData.rows[0].id}')`,
    );
    await client.query("COMMIT");
  } catch (error) {
    console.error("Erro durante a Busca:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}

export async function saveRegistry(req: Request, res: Response) {
  const client = await pool.connect();
  const registry = req.body;
  try {
    await client.query("BEGIN");
    for (const subject of registry.subjects) {
      const subject_id = [subject.id];
      console.log(subject_id);
      await client.query(
        ` INSERT INTO registries (student_id, subject_id) VALUES ('${registry.student.id}', '${subject_id}')`,
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro durante a transação:", error);
    return res.status(500).json({ error });
  } finally {
    client.release();
  }
}
