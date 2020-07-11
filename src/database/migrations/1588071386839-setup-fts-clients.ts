import { MigrationInterface, QueryRunner } from 'typeorm';

export class setupFtsClients1588071386839 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
    ALTER TABLE client
        ADD COLUMN IF NOT EXISTS "documentWithWeights" tsvector;
    UPDATE client
    
    SET "documentWithWeights" = setweight(to_tsvector(name), 'A') || setweight(to_tsvector(phone), 'B');

    CREATE INDEX IF NOT EXISTS document_weights_idx ON client USING GIN ("documentWithWeights");
    CREATE OR REPLACE FUNCTION client_tsvector_trigger() RETURNS trigger AS $$
        begin
            new."documentWithWeights" := 
                setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(new.phone, '')), 'B');
            return new;
        end
    $$ LANGUAGE plpgsql;
    CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON client
        FOR EACH ROW EXECUTE PROCEDURE client_tsvector_trigger();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
