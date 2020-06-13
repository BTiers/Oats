import {MigrationInterface, QueryRunner} from "typeorm";

export class renameCandidatetoofferId1592045309820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            ALTER TABLE candidate_to_offer 
            RENAME COLUMN "candidateToOfferId" TO id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            ALTER TABLE candidate_to_offer 
            RENAME COLUMN id TO "candidateToOfferId";
        `);
    }

}
