import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  Unique,
  RelationCount,
  ManyToOne,
} from 'typeorm';
import slugify from 'slugify';

import User from '../user/user.entity';
import CandidateToOffer from './offer/candidate-to-offer.entity';
import Qualification from './qualification/qualification.entity';
import Interview from './interview/interview.entity';

@Entity()
@Unique(['name', 'slug'])
class Candidate {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public name: string;

  @Column()
  public slug: string;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }

  @Column()
  public email: string;

  @Column()
  public resume: string;

  @ManyToOne(() => User, (user) => user.candidates)
  public referrer: User;

  @OneToMany(() => CandidateToOffer, (candidateToOffer) => candidateToOffer.candidate)
  public processes!: CandidateToOffer[];

  @RelationCount((candidate: Candidate) => candidate.processes)
  public processCount: number;

  @OneToOne(() => Qualification)
  @JoinColumn()
  public qualification!: Qualification;

  @OneToMany(() => Interview, (interview) => interview.candidate)
  @JoinColumn()
  public interviews!: Interview[];

  @RelationCount((candidate: Candidate) => candidate.interviews)
  public interviewCount: number;

  @Column("tsvector", { select: false })
  documentWithWeights: any;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default Candidate;
