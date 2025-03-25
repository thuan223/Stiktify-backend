import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConnectionWithDriver, Neo4jConfig } from './neo4j-config.interface';
import { Connection } from 'cypher-query-builder';
import { createDatabaseConfig } from './neo4j.utils';
import { NEO4J_CONFIG, NEO4J_CONNECTION } from './neo4j.constants';
import { QueryRepository } from './neo4j.service';

@Module({
    providers: [QueryRepository]
})
export class Neo4jModule {
    static forRootAsync(customConfig?: Neo4jConfig): DynamicModule {
        return {
            module: Neo4jModule,
            imports: [ConfigModule],
            global: true,
            exports: [QueryRepository],
            providers: [
                {
                    provide: NEO4J_CONFIG,
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => createDatabaseConfig(configService, customConfig),
                },
                {
                    provide: NEO4J_CONNECTION,
                    inject: [NEO4J_CONFIG],
                    useFactory: async (config: Neo4jConfig) => {
                        try {
                            const { host, scheme, port, password, username } = config
                            const connection = new Connection(`${scheme}://${host}:${port}`, {
                                username,
                                password
                            }) as ConnectionWithDriver;
                            await connection.driver.verifyConnectivity()
                            console.log("SUCCESS");
                            return connection;
                        } catch (error) {
                            // throw new Error(error)
                            console.log(error);
                        }
                    }
                }
            ]
        }
    }
}
