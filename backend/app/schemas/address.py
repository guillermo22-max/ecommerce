import re

from pydantic import BaseModel, ConfigDict, field_validator

PHONE_PATTERN = re.compile(r"^[0-9+\-()\s]{7,20}$")
POSTAL_CODE_PATTERN = re.compile(r"^[A-Za-z0-9\-\s]{3,10}$")


class AddressBase(BaseModel):
    full_name: str
    phone: str | None = None
    line1: str
    line2: str | None = None
    city: str
    state: str | None = None
    postal_code: str
    country: str
    is_default: bool = False

    @field_validator("full_name", "line1", "city")
    @classmethod
    def not_blank(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Este campo debe tener al menos 2 caracteres")
        return value

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        value = value.strip()
        if not PHONE_PATTERN.match(value):
            raise ValueError("Ingresa un teléfono válido (7 a 20 dígitos)")
        return value

    @field_validator("postal_code")
    @classmethod
    def valid_postal_code(cls, value: str) -> str:
        value = value.strip()
        if not POSTAL_CODE_PATTERN.match(value):
            raise ValueError("Ingresa un código postal válido")
        return value

    @field_validator("country")
    @classmethod
    def valid_country(cls, value: str) -> str:
        value = value.strip().upper()
        if not re.match(r"^[A-Z]{2}$", value):
            raise ValueError("Usa el código de país de 2 letras (ej. MX, US)")
        return value


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    line1: str | None = None
    line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    is_default: bool | None = None


class AddressRead(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
