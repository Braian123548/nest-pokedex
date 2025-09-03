import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {
    //isInt, isPositive,min 1
    @IsInt({message: "Deber ser un numero"})
    @IsPositive({message:"Debe ser un numero positivo"})
    @Min(1 ,{message:"Debe tener al menos un caracter"})
    no:number;
    @IsString({message:"Deber ser un string"})
    @MinLength(1 ,{message:"Debe contener al menos un carater"})
    //isString, Minlength 1
    name:string
}
