import { Request, Response, Router } from 'express';
import { CountryService } from '@/modules/country/country.service';
import { asyncHandler, validateDto } from '@utils';
import { queryCountriesSchema } from '@/modules/country/schemas/query-countries.schema';

export class CountryController {
  public router: Router;
  private countryService: CountryService;

  constructor(countryService: CountryService) {
    this.router = Router();
    this.countryService = countryService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asyncHandler(this.getCountries));
    this.router.get('/:iso', asyncHandler(this.getCountryByIso));
    this.router.get('/:countryId/states', asyncHandler(this.getStates));
    this.router.get('/states/:stateId/cities', asyncHandler(this.getCities));
  }

  private getCountries = async (req: Request, res: Response): Promise<void> => {
    const query = validateDto(queryCountriesSchema, req.query);
    const result = await this.countryService.getCountries(query);
    res.json({ data: result });
  };

  private getCountryByIso = async (req: Request, res: Response): Promise<void> => {
    const country = await this.countryService.getCountryByIso(req.params.iso as string);
    res.json({ data: country });
  };

  private getStates = async (req: Request, res: Response): Promise<void> => {
    const countryId = Number(req.params.countryId);
    if (Number.isNaN(countryId)) throw new Error('Country id must be a valid number');
    const states = await this.countryService.getStatesByCountry(countryId);
    res.json({ data: states });
  };

  private getCities = async (req: Request, res: Response): Promise<void> => {
    const stateId = Number(req.params.stateId);
    const cities = await this.countryService.getCitiesByState(stateId);
    res.json({ data: cities });
  };
}
