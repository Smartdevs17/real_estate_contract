import { expect } from 'chai';
import { ethers } from 'hardhat';
import { RealEstate } from '../typechain-types';

describe('RealEstate Contract', function () {
    let RealEstate, realEstate: RealEstate, owner: any, addr1: any, addr2: any;

    beforeEach(async function () {
        RealEstate = await ethers.getContractFactory('RealEstate');
        [owner, addr1, addr2, ] = await ethers.getSigners();
        realEstate = await RealEstate.deploy();
    });

    it('Should deploy the contract', async function () {
        expect(await realEstate.getAddress()).to.properAddress;
    });

    it('Should create a property', async function () {
        await realEstate.addProperty('123 Main St', 100);
        const property = await realEstate.properties(1);
        expect(property.location).to.equal('123 Main St');
        expect(property.price).to.equal(100);
    });

    it('Should transfer property ownership', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await realEstate.transferOwnership(1,  addr1.address);
        const newOwner = await realEstate.ownerOf(1);
        expect(newOwner).to.equal( addr1.address);
    });

    it('Should update property price', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await realEstate.updatePropertyPrice(1, 200);
        const property = await realEstate.properties(1);
        expect(property.price).to.equal(200);
    });

    it('Should not allow non-owner to transfer property', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.connect(addr1).transferOwnership(1, addr2.address)).to.be.revertedWith('Only the owner can transfer ownership');
    });

    it('Should not allow non-owner to update price', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.connect(addr1).updatePropertyPrice(1, 200)).to.be.revertedWith('Only the owner can update the price');
    });

    it('Should return correct property count', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await realEstate.addProperty('456 Elm St', 150);
        const count = await realEstate.propertyCount();
        expect(count).to.equal(2);
    });

    it('Should return correct property details', async function () {
        await realEstate.addProperty('123 Main St', 100);
        const property = await realEstate.properties(1);
        expect(property.location).to.equal('123 Main St');
        expect(property.price).to.equal(100);
    });

    it('Should allow owner to delete property', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await realEstate.deleteProperty(1);
        expect((await realEstate.properties(1))[0]).to.equal(0);
    });

    it('Should not allow non-owner to delete property', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.connect(addr1).deleteProperty(1)).to.be.revertedWith('Only the owner can delete the property');
    });

    it('Should emit PropertyCreated event', async function () {
        await expect(realEstate.addProperty('123 Main St', 100))
            .to.emit(realEstate, 'PropertyAdded')
            .withArgs(1, '123 Main St', 100, owner.address);
    });

      it('Should emit PropertyTransferred event', async function () {
          await realEstate.addProperty('123 Main St', 100);
          await expect(realEstate.transferOwnership(1, addr1.address))
              .to.emit(realEstate, 'OwnershipTransferred')
              .withArgs(1, addr1.address);
      });

    it('Should emit PriceUpdated event', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.updatePropertyPrice(1, 200))
            .to.emit(realEstate, 'PropertyPriceUpdated')
            .withArgs(1, 200);
    });

    it('Should emit PropertyDeleted event', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.deleteProperty(1))
            .to.emit(realEstate, 'PropertyDeleted')
            .withArgs(1);
    });

    it('Should not allow creating property with empty location', async function () {
        await expect(realEstate.addProperty('', 100)).to.be.revertedWith('Location cannot be empty');
    });

    it('Should not allow creating property with zero price', async function () {
        await expect(realEstate.addProperty('123 Main St', 0)).to.be.revertedWith('Price must be greater than zero');
    });

    it('Should not allow updating price to zero', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.updatePropertyPrice(1, 0)).to.be.revertedWith('New price must be greater than zero');
    });

    it('Should not allow transferring non-existent property', async function () {
        await expect(realEstate.transferOwnership(0, addr1.address)).to.be.revertedWith('Invalid property ID');
    });

    it('Should not allow deleting non-existent property', async function () {
        await expect(realEstate.deleteProperty(0)).to.be.revertedWith('Invalid property ID');
    });

    it('Should not allow transferring to zero address', async function () {
        await realEstate.addProperty('123 Main St', 100);
        await expect(realEstate.transferOwnership(1, ethers.ZeroAddress)).to.be.revertedWith('New owner address cannot be zero');
    });
});
