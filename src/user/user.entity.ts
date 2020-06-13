import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Unique,
  RelationCount,
} from 'typeorm';
import slugify from 'slugify';
import * as bcrypt from 'bcrypt';

import Offer from '../offer/offer.entity';
import Client from '../client/client.entity';
import Candidate from '../candidate/candidate.entity';
import Interview from '../candidate/interview/interview.entity';

@Entity()
@Unique(['name', 'slug'])
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public email: string;

  @Column({ select: false })
  public password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column()
  public slug: string;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }

  @OneToMany(() => Offer, (offer: Offer) => offer.referrer)
  public offers: Offer[];

  @RelationCount((user: User) => user.offers)
  public offerCount: number;

  @OneToMany(() => Client, (client: Client) => client.accountManager)
  public clients: Client[];

  @RelationCount((user: User) => user.clients)
  public clientCount: number;

  @OneToMany(() => Candidate, (candidate: Candidate) => candidate.referrer)
  public candidates: Candidate[];

  @RelationCount((user: User) => user.candidates)
  public candidateCount: number;

  @OneToMany((type) => Interview, (interview) => interview.recruiter)
  public interviews!: Interview[];

  @Column("tsvector", { select: false })
  documentWithWeights: any;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default User;
