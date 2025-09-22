import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class PokemonService {

  private defaultLimit: number;


  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService :ConfigService
  ) {

    // console.log(process.env.DEFAULT_LIMIT);
     this.defaultLimit = configService.get<number>('defaultLimit')??7
    //  console.log({defaultLimit: configService.get<number>('defaultLimit')});
    
   }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()

    try {

      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;

    } catch (error) {
       this.handleExceptions(error)
    }


  }

  findAll(paginationDTO: PaginationDto) {

   

    const {limit = this.defaultLimit , offset = 0} = paginationDTO;

       return this.pokemonModel.find().limit(limit).skip(offset).sort({no:1}).select('-__v')
  }

  async findOne(term: string) {

    let pokemon: Pokemon | null = null;


    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }

    //MONGO ID

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }


    //NAME

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }

    if (!pokemon) throw new NotFoundException(`El pokemon con el id nombre o termino "${term}" no fue encontrado`)

    return pokemon;

  }



  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);


    if (updatePokemonDto.name) {

      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()
    }

    try {

      await pokemon.updateOne(updatePokemonDto)
      return { ...pokemon.toJSON(), ...updatePokemonDto };


    } catch (error) {
       this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id)
    // await pokemon.deleteOne();
    // return {id};
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const {deletedCount} = await this.pokemonModel.deleteOne({_id:id});
    if (deletedCount === 0) {
      throw new BadRequestException(`El pokemon con el id ${id} no fue encontrado`)
    }

    return;
  }


  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`El pokemon ya existe en la base de datos ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException("No puedes crear un pokemon revisa el server log");

  }
}
