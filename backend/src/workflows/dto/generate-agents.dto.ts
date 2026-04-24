import { IsString, MinLength } from 'class-validator';

export class GenerateAgentsDto {
  @IsString()
  @MinLength(10)
  prompt: string;
}
