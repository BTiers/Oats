import { MigrationInterface, QueryRunner } from 'typeorm';

export class setupFtsOffers1588081107104 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        ALTER TABLE offer
            ADD COLUMN IF NOT EXISTS "documentWithWeights" tsvector;
        UPDATE offer
        
        SET "documentWithWeights" = setweight(to_tsvector(job), 'A') || setweight(to_tsvector("contractType"), 'B');
    
        CREATE INDEX IF NOT EXISTS offer_document_weights_idx ON offer USING GIN ("documentWithWeights");
        CREATE OR REPLACE FUNCTION offer_tsvector_trigger() RETURNS trigger AS $$
            begin
                new."documentWithWeights" := 
                    setweight(to_tsvector('english', coalesce(new.job, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(new."contractType", '')), 'B');
                return new;
            end
        $$ LANGUAGE plpgsql;
        CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON offer
            FOR EACH ROW EXECUTE PROCEDURE offer_tsvector_trigger();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
