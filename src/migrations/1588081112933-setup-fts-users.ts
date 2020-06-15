import { MigrationInterface, QueryRunner } from 'typeorm';

export class setupFtsUsers1588081112933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "documentWithWeights" tsvector;
        UPDATE "user"
        
        SET "documentWithWeights" = setweight(to_tsvector(name), 'A') || setweight(to_tsvector(slug), 'B');
    
        CREATE INDEX user_document_weights_idx ON "user" USING GIN ("documentWithWeights");
        CREATE FUNCTION user_tsvector_trigger() RETURNS trigger AS $$
            begin
                new."documentWithWeights" := 
                    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(new.slug, '')), 'B');
                return new;
            end
        $$ LANGUAGE plpgsql;
        CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON "user"
            FOR EACH ROW EXECUTE PROCEDURE user_tsvector_trigger();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
