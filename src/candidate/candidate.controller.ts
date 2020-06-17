import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import Controller from '../interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';

import Candidate from './candidate.entity';

import CandidateNotFoundException from '../exceptions/CandidateNotFoundException';
import NoCandidatesFoundException from '../exceptions/NoCandidatesFoundException';

class CandidateController implements Controller {
  public path = '/candidates';
  public router = Router();

  private candidateRepository = getRepository(Candidate);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * definitions:
     *  Candidate:
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the candidate
     *      name:
     *        type: string
     *        description: Fullname of the candidate
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      email:
     *        type: string
     *        description: Candidate email
     *      resume:
     *        type: string
     *        description: Dummy resume, ~30words of LoremIpsum
     *      createdDate:
     *        type: string
     *        description: Creation date of the candidate, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the candidate, can be parsed into a JS Date object
     *      processCount:
     *        type: number
     *        description: Number of processes the candidate currently have
     *      interwiewCount:
     *        type: number
     *        description: Number of interview the candidate have been part of
     */


    /**
     * @swagger
     * definitions:
     *  CandidateWithReferrer:
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the candidate
     *      name:
     *        type: string
     *        description: Fullname of the candidate
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      email:
     *        type: string
     *        description: Candidate email
     *      resume:
     *        type: string
     *        description: Dummy resume, ~30words of LoremIpsum
     *      createdDate:
     *        type: string
     *        description: Creation date of the candidate, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the candidate, can be parsed into a JS Date object
     *      referrer:
     *        $ref: '#/definitions/User'
     *      processCount:
     *        type: number
     *        description: Number of processes the candidate currently have
     *      interwiewCount:
     *        type: number
     *        description: Number of interview the candidate have been part of
     */

    /**
     * @swagger
     * definitions:
     *  CandidateWithRelations:
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the candidate
     *      name:
     *        type: string
     *        description: Fullname of the candidate
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      email:
     *        type: string
     *        description: Candidate email
     *      resume:
     *        type: string
     *        description: Dummy resume, ~30words of LoremIpsum
     *      createdDate:
     *        type: string
     *        description: Creation date of the candidate, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the candidate, can be parsed into a JS Date object
     *      referrer:
     *        $ref: '#/definitions/User'
     *      processCount:
     *        type: number
     *        description: Number of processes the candidate currently have
     *      interwiewCount:
     *        type: number
     *        description: Number of interview the candidate have been part of
     */


    /**
     * @swagger
     * 
     * /candidates:
     *  get:
     *    summary: All Candidate
     *    description: Get a list of all candidates
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Candidates (Authenticated only)
     *    parameters:
     *      - in: header
     *        name: Authorization
     *        schema:
     *          description: The server set HTTPOnly cookie 
     *          type: string
     *      - in: header
     *        name: x-xsrf-token
     *        schema:
     *          description: The XSRFToken to refresh
     *          type: string
     *    responses:
     *      200:
     *        description: All the candidates
     *        schema:
     *          type: array
     *          items:
     *            $ref: '#/definitions/CandidateWithReferrer'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}`, authMiddleware, this.getAllCandidate);

    /**
     * @swagger
     * 
     * /candidates/{slug}:
     *  get:
     *    summary: Candidate by slug
     *    description: Get the candidate represented by the given slug
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Candidates (Authenticated only)
     *    parameters:
     *      - in: path
     *        name: slug
     *        schema:
     *          type: string
     *        required: true
     *        description: Slug of the Candidate to get
     *      - in: header
     *        name: Authorization
     *        schema:
     *          description: The server set HTTPOnly cookie 
     *          type: string
     *      - in: header
     *        name: x-xsrf-token
     *        schema:
     *          description: The XSRFToken to refresh
     *          type: string
     *    responses:
     *      200:
     *        description: Candidate with {slug}
     *        schema:
     *          $ref: '#/definitions/CandidateWithRelations'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      404:
     *        description: No candidate found
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getCandidateBySlug);
  }

  private getAllCandidate = async (request: Request, response: Response, next: NextFunction) => {
    const candidates = await this.candidateRepository.find({ relations: ['referrer'] });

    if (candidates && candidates.length) {
      response.send(candidates);
    } else {
      next(new NoCandidatesFoundException());
    }
  };

  private getCandidateBySlug = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const candidate = await this.candidateRepository.findOne(
      { slug },
      { relations: ['processes', 'processes.offer', 'referrer', 'interviews'] },
    );

    if (candidate) {
      response.send(candidate);
    } else {
      next(new CandidateNotFoundException(slug));
    }
  };
}

export default CandidateController;
