import { MigrationInterface, QueryRunner } from 'typeorm';

export class setupFtsCandidates1588081099903 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        ALTER TABLE candidate
            ADD COLUMN IF NOT EXISTS "documentWithWeights" tsvector;
        UPDATE candidate
        
        SET "documentWithWeights" = setweight(to_tsvector(name), 'A') || setweight(to_tsvector(resume), 'B');
    
        CREATE INDEX candidate_document_weights_idx ON candidate USING GIN ("documentWithWeights");
        CREATE FUNCTION candidate_tsvector_trigger() RETURNS trigger AS $$
            begin
                new."documentWithWeights" := 
                    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(new.resume, '')), 'B');
                return new;
            end
        $$ LANGUAGE plpgsql;
        CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON candidate
            FOR EACH ROW EXECUTE PROCEDURE candidate_tsvector_trigger();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
