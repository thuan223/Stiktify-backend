import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { NEO4J_CONNECTION } from './neo4j.constants';
import { Connection } from 'cypher-query-builder';

@Injectable()
export class QueryRepository implements OnApplicationShutdown {
    constructor(
        @Inject(NEO4J_CONNECTION)
        private readonly connection: Connection
    ) { }

    onApplicationShutdown() {
        this.connection.close()
    }

    initQuery() {
        return this.connection.query()
    }


}
